import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, ContextBridgeBundle } from '../schema/contextBridge.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Distills raw conversation turns using Google Gemini AI.
 * Validates the API key and strictly catches errors without silent fallbacks.
 */
export async function distillConversation(
  messages: ChatMessage[],
  source: string = 'web-chat'
): Promise<ContextBridgeBundle> {
  const fullText = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const rawTokens = Math.round(fullText.length / 4);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'Missing GEMINI_API_KEY in server/.env! Please add your Gemini API key (from https://aistudio.google.com/) to enable ContextBridge distillation.'
    );
  }

  try {
    console.log(`[ContextBridge] 🤖 Contacting Gemini API to distill ${messages.length} conversation turns...`);
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are ContextBridge, an intelligent AI memory engine.
Analyze the following multi-turn conversation and distill it into a structured, zero-loss handoff bundle.
Identify:
1. The active user goal.
2. Architectural decisions made (with rationale and rejected alternatives).
3. Touched code files, key functions, and snippets.
4. Explicit rejected paths (options considered but rejected, so the next agent does NOT re-suggest them).
5. Immediate next actionable steps.

Return strictly valid JSON adhering to this schema:
{
  "activeGoal": string,
  "techStack": string[],
  "decisions": [
    {
      "topic": string,
      "decision": string,
      "reason": string,
      "rejectedAlternatives": string[]
    }
  ],
  "codeContext": {
    "activeFiles": string[],
    "keySnippets": [
      {
        "filePath": string,
        "language": string,
        "snippet": string,
        "purpose": string
      }
    ]
  },
  "rejectedPaths": string[],
  "nextSteps": string[],
  "openQuestions": string[]
}

Conversation:
${fullText}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    const compressedTokens = Math.round(responseText.length / 4);
    const savingsPercent =
      rawTokens > 0
        ? Math.max(0, Math.round(((rawTokens - compressedTokens) / rawTokens) * 100))
        : 0;

    return {
      id: `cb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source,
      project: {
        name: 'Active Project',
        techStack: parsed.techStack || ['TypeScript'],
      },
      activeGoal: parsed.activeGoal || 'General Development Task',
      decisions: parsed.decisions || [],
      codeContext: parsed.codeContext || { activeFiles: [], keySnippets: [] },
      rejectedPaths: parsed.rejectedPaths || [],
      nextSteps: parsed.nextSteps || [],
      openQuestions: parsed.openQuestions || [],
      metrics: {
        rawTurns: messages.length,
        rawTokenEstimate: rawTokens,
        compressedTokenEstimate: compressedTokens,
        savingsPercent,
      },
    };
  } catch (err: any) {
    console.error('[ContextBridge] ❌ Gemini API Error:', err.message);
    throw new Error(`Gemini API distillation failed: ${err.message}`);
  }
}

export function formatHandoffMarkdown(bundle: ContextBridgeBundle): string {
  return `# 🌉 ContextBridge Handoff: ${bundle.activeGoal}
*Captured: ${bundle.createdAt} | Source: ${bundle.source}*
*Tokens: ${bundle.metrics.rawTokenEstimate} raw ➔ ${bundle.metrics.compressedTokenEstimate} compressed (${bundle.metrics.savingsPercent}% reduction)*

---

## 🎯 Active Goal
${bundle.activeGoal}

## 📋 Architectural Decisions & Rationale
${bundle.decisions
  .map(
    (d) =>
      `- **${d.topic}**: ${d.decision}${d.reason ? ` — *${d.reason}*` : ''}${
        d.rejectedAlternatives.length > 0 ? ` (Rejected: ${d.rejectedAlternatives.join(', ')})` : ''
      }`
  )
  .join('\n')}

${
  bundle.rejectedPaths.length > 0
    ? `## 🚫 Rejected Paths (Do Not Re-propose)
${bundle.rejectedPaths.map((p) => `- ❌ ${p}`).join('\n')}
`
    : ''
}

## 💻 Active Code & Files
- **Files Modified/Referenced**: ${bundle.codeContext.activeFiles.join(', ') || 'In-memory'}

${bundle.codeContext.keySnippets
  .map(
    (s) => `### \`${s.filePath}\`
\`\`\`${s.language}
${s.snippet}
\`\`\``
  )
  .join('\n\n')}

## 🚀 Next Steps to Resume Immediately
${bundle.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}
`;
}
