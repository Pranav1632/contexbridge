import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, ContextBridgeBundle, ContextBridgeBundleSchema } from '../schema/contextBridge.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Distills raw conversation turns into a structured ContextBridgeBundle.
 * Uses real Gemini API if GEMINI_API_KEY is present;
 * otherwise automatically uses the deterministic heuristic engine (offline zero-fail).
 */
export async function distillConversation(
  messages: ChatMessage[],
  source: string = 'web-chat'
): Promise<ContextBridgeBundle> {
  const fullText = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const rawTokens = Math.round(fullText.length / 4);

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      console.log('[ContextBridge] 🤖 Using live Gemini LLM for cognitive distillation...');
      return await extractWithGemini(messages, source, rawTokens, apiKey);
    } catch (err: any) {
      console.warn('[ContextBridge] ⚠️ Gemini API call failed or quota exceeded. Falling back to local offline engine:', err.message);
    }
  } else {
    console.log('[ContextBridge] ⚡ No GEMINI_API_KEY detected in .env. Running deterministic heuristic engine (offline demo mode)...');
  }

  return extractHeuristically(messages, source, rawTokens);
}

/**
 * Real LLM distillation via Google Gemini
 */
async function extractWithGemini(
  messages: ChatMessage[],
  source: string,
  rawTokens: number,
  apiKey: string
): Promise<ContextBridgeBundle> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `You are ContextBridge, an intelligent AI memory engine.
Analyze the following multi-turn conversation and distill it into a structured, zero-loss handoff bundle.
Identify the active user goal, architectural decisions made (with rationale and rejected alternatives), touched code files and snippets, rejected paths that the next AI should NOT re-propose, and immediate next steps.

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
${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const parsed = JSON.parse(responseText);

  const compressedTokens = Math.round(responseText.length / 4);
  const savingsPercent = rawTokens > 0 ? Math.max(0, Math.round(((rawTokens - compressedTokens) / rawTokens) * 100)) : 0;

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
}

/**
 * Deterministic offline extractor
 */
function extractHeuristically(
  messages: ChatMessage[],
  source: string,
  rawTokens: number
): ContextBridgeBundle {
  const id = `cb-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  let activeGoal = 'General architecture & implementation task';
  if (userMessages.length > 0) {
    const firstUserMsg = userMessages[0].content;
    const goalMatch = firstUserMsg.match(/(?:need to|want to|build|implement|create|design)\s+([^.\n]+)/i);
    if (goalMatch) {
      activeGoal = `Implement ${goalMatch[1].trim()}`;
    } else {
      activeGoal = firstUserMsg.slice(0, 120).trim();
    }
  }

  const decisions: { topic: string; decision: string; reason?: string; rejectedAlternatives: string[] }[] = [];
  const rejectedPaths: string[] = [];

  for (const msg of messages) {
    const text = msg.content;
    const insteadOfMatch = text.match(/(?:use|using|chose|chosen)\s+([A-Za-z0-9_-]+)\s+instead of\s+([A-Za-z0-9_-]+)/i);
    if (insteadOfMatch) {
      decisions.push({
        topic: 'Technology Selection',
        decision: `Use ${insteadOfMatch[1]}`,
        reason: 'Selected over alternative during architectural planning',
        rejectedAlternatives: [insteadOfMatch[2]],
      });
      rejectedPaths.push(`${insteadOfMatch[2]} (replaced by ${insteadOfMatch[1]})`);
    }

    const rejectMatch = text.match(/(?:reject|rejected|avoid|don't use|not using)\s+([A-Za-z0-9_-]+)(?:\s+because\s+([^.\n]+))?/i);
    if (rejectMatch && !rejectedPaths.includes(rejectMatch[1])) {
      rejectedPaths.push(rejectMatch[1] + (rejectMatch[2] ? ` (${rejectMatch[2].trim()})` : ''));
    }
  }

  const keySnippets: { filePath: string; language: string; snippet: string; purpose?: string }[] = [];
  const activeFilesSet = new Set<string>();

  for (const msg of assistantMessages) {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(msg.content)) !== null) {
      const language = match[1] || 'typescript';
      const snippet = match[2].trim();
      if (snippet.length > 20) {
        const fileCommentMatch = snippet.match(/^(?:\/\/|#|\/\*)\s*([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)/m);
        const filePath = fileCommentMatch ? fileCommentMatch[1] : `snippet-${keySnippets.length + 1}.${language === 'typescript' ? 'ts' : 'txt'}`;
        activeFilesSet.add(filePath);

        if (keySnippets.length < 5) {
          keySnippets.push({
            filePath,
            language,
            snippet: snippet.slice(0, 1500),
            purpose: 'Extracted active code context',
          });
        }
      }
    }
  }

  const nextSteps: string[] = [];
  const openQuestions: string[] = [];

  const lastAssistant = assistantMessages[assistantMessages.length - 1]?.content || '';
  const todoRegex = /(?:TODO|Next steps?|Remaining|Let's next):\s*([^\n]+)/gi;
  let todoMatch;
  while ((todoMatch = todoRegex.exec(lastAssistant)) !== null) {
    nextSteps.push(todoMatch[1].trim());
  }

  if (nextSteps.length === 0) {
    nextSteps.push('Complete implementation and write verification tests');
    nextSteps.push('Review edge cases and error handling');
  }

  const compressedTokens = Math.round(
    (activeGoal.length +
      JSON.stringify(decisions).length +
      keySnippets.reduce((acc, s) => acc + s.snippet.length, 0) +
      nextSteps.join(' ').length) /
      4
  );

  const savingsPercent = rawTokens > 0 ? Math.max(0, Math.round(((rawTokens - compressedTokens) / rawTokens) * 100)) : 0;

  return {
    id,
    createdAt,
    source,
    project: {
      name: 'Active Project',
      techStack: Array.from(new Set(['TypeScript', 'Node.js', ...decisions.map((d) => d.decision)])),
    },
    activeGoal,
    decisions: decisions.length > 0 ? decisions : [
      {
        topic: 'Core Strategy',
        decision: 'Proceed with incremental TypeScript implementation',
        rejectedAlternatives: ['Monolithic rewrite'],
      },
    ],
    codeContext: {
      activeFiles: Array.from(activeFilesSet),
      keySnippets,
    },
    rejectedPaths: Array.from(new Set(rejectedPaths)),
    nextSteps,
    openQuestions,
    metrics: {
      rawTurns: messages.length,
      rawTokenEstimate: rawTokens,
      compressedTokenEstimate: compressedTokens,
      savingsPercent,
    },
  };
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
