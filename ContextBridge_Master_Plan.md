# ContextBridge: Master Execution Plan & Jev Integration Roadmap

## 1. Executive Summary & Core Value Proposition

**Problem**: AI power users and developers constantly hit tier rate limits ("Usage limit reached with Claude 3.7 / GPT-4o until 4:00 PM"). Switching to another AI means starting from scratch, manually copying code, and re-explaining architecture. Raw chat transcripts are too large and exceed token limits.

**Solution**: **ContextBridge** — the universal, cross-platform context & memory agent. It captures live conversations, compresses raw turns into an **OpenContext Standard (`.contextbridge`)**, and teleports full project state seamlessly across web chats, terminal CLIs, and IDE agents with zero knowledge loss.

---

## 2. Definitive Tech Stack & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. CAPTURE & INTAKE                             │
│  - Primary: Chrome Extension (Manifest V3, React + Tailwind)           │
│  - Fallback: Local Dropzone UI (Paste transcript / drag export file)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        2. ORCHESTRATION & CORE                         │
│  - Runtime: Node.js (v20+) + TypeScript                                │
│  - Web API: Fastify / Hono (Micro-latency server)                      │
│  - Schema & Type Safety: Zod                                           │
│  - Fast LLM Extractor: Gemini 2.5 Flash / Claude 3.5 Haiku API         │
│  - Storage: Local File System (`.contextbridge/`) + SQLite FTS         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        3. HANDOFF & RESTORATION                        │
│  - Browser Auto-Pilot: Playwright (Chromium automates fresh AI tabs)   │
│  - Terminal & IDE Agents: MCP Server (@modelcontextprotocol/sdk)       │
│  - Repository Rules: Auto-generates CLAUDE.md & AGENTS.md              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               4. FUTURE INTEGRATION: JEV (TYPESAFE AI)                 │
│  - Ultra-fast (70-200ms) System 1 Decision Model                       │
│  - Non-autoregressive classification, token budgeting & secret guard  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Future Integration: Jev (TypeSafe AI) — Why, How, and Reasons

### What is Jev?
**Jev** (by TypeSafe AI, `@typesafe-ai/sdk`) is a non-autoregressive **"System One"** AI decision model. Instead of streaming text token-by-token like generative LLMs, Jev takes unstructured context and answers typed mathematical questions in **70ms to 200ms** at a fraction of generative costs. It operates on three strict primitives:
1. `noul`: Probabilistic Boolean / Yes-No queries.
2. `choice`: Strict categorical classification from a predefined list.
3. `score`: Continuous numerical rating / ordinal evaluation.

---

### The "WHY": Why ContextBridge Needs Jev

| Challenge in Context Handoff | Traditional Generative LLM Approach | With Jev (TypeSafe AI) Integration |
|---|---|---|
| **Chat Intent Classification** | Requires sending a 20k token prompt to an LLM, taking 3–6 seconds to identify if it's "Coding" or "Debugging". | **70ms Decision**: `choice` primitive classifies intent instantly before starting heavy processing. |
| **Token-Budget Pruning** | LLMs truncate text blindly or summarize everything into a lossy paragraph. | **Granular Turn Scoring**: `score` primitive ranks every message's architectural value (1–5) and drops low-value turns deterministically. |
| **Secret & Credential Leakage** | Regex misses obfuscated keys; generative LLMs are prone to hallucinating or skipping redaction. | **Guaranteed Decision Guard**: `noul` primitive performs high-confidence binary checks for sensitive credentials with zero hallucination. |
| **Cost & Latency at Scale** | Using multi-turn LLMs to clean 50+ turns costs significant API dollars and induces 5-10s latency. | **Sub-150ms and 90% cheaper**, enabling real-time background memory updates as you type. |

---

### The "HOW": Concrete Integration Architecture

#### A. Architecture Split: Two-Tier Cognitive Engine
- **System 1 (Jev Fast Decisions)**: Sub-second routing, classification, redaction flags, and token budget prioritization.
- **System 2 (Generative LLM)**: Deep synthesis, narrative handoff creation, and architectural diffing.

#### B. TypeScript Implementation Blueprint
```typescript
// future-integrations/jevEngine.ts
import { TypeSafeClient, choice, noul, score } from '@typesafe-ai/sdk';

export interface JevTriageResult {
  chatType: 'coding' | 'debugging' | 'architecture' | 'learning';
  containsSecrets: boolean;
  architecturalImportance: number;
}

export async function runJevSystemOneTriage(transcriptChunk: string): Promise<JevTriageResult> {
  const client = new TypeSafeClient({
    apiKey: process.env.TYPESAFE_API_KEY
  });

  const { answers } = await client.systemOne({
    state: transcriptChunk,
    questions: {
      // 1. Choice: Selects optimal schema layout in 100ms
      chat_type: choice("What is the primary mode of this AI chat?", {
        coding: "Implementing features, writing functions, refactoring codebase",
        debugging: "Analyzing stack traces, compiler errors, or bug reproduction",
        architecture: "Designing databases, API contracts, system components",
        learning: "Conceptual explanations, tutorials, Q&A"
      }),

      // 2. Noul: Zero-tolerance security check
      contains_secrets: noul("Does this text contain active API tokens, private keys, or passwords?"),

      // 3. Score: Token budget optimization rating
      importance: score("Rate the long-term architectural significance of this turn (1=fluff/banter, 5=core decision)")
    }
  });

  return {
    chatType: answers.chat_type,
    containsSecrets: answers.contains_secrets.noul > 0.85,
    architecturalImportance: answers.importance.score
  };
}
```

---

## 4. Rebuilt 24-Hour Hackathon Implementation Schedule

### Hours 00:00 – 04:00: Schema & Core Engine
- [ ] Initialize monorepo in `d:\project\alan-hack`:
  - `packages/core`: OpenContext schema (`zod`), transcript parser.
  - `packages/mcp`: Local Model Context Protocol server.
  - `packages/automation`: Playwright auto-pilot scripts.
  - `packages/extension`: Chrome Extension UI.
- [ ] Define the `.contextbridge` schema (Goals, Decisions, Rejected Options, Code State, Next Steps).
- [ ] Implement generative extraction pipeline (Gemini Flash / Claude Haiku).

### Hours 04:00 – 10:00: Playwright Auto-Pilot & MCP Server
- [ ] Implement Playwright target injection script:
  - Command: `npm run teleport -- --target gemini --bundle ./latest.json`
  - Playwright launches Chromium, navigates to target AI web page, pastes context, submits.
- [ ] Implement MCP Server exposing `get_active_context` and `save_checkpoint` for terminal agents (Claude Code, Antigravity).

### Hours 10:00 – 16:00: Chrome Extension & Live Dashboard
- [ ] Chrome extension content script to scrape ChatGPT/Claude web DOM with 1 click.
- [ ] Visual Web Dashboard:
  - Token compression counter (*"34,000 tokens ➔ 2,800 tokens: 91% saved"*).
  - Visual Decision Tree (*Decisions Made vs. Rejected Alternatives*).
  - Target Teleport buttons (*Claude Code, Cursor, ChatGPT, Gemini*).

### Hours 16:00 – 20:00: Testing, Offline Failsafes & Jev Feature Slide
- [ ] Prepare offline cached demo fixtures in case venue Wi-Fi lags.
- [ ] Add Jev Architecture Slide / Mock Integration: demonstrate how System 1 (Jev) complements System 2 (Generative LLMs).

### Hours 20:00 – 24:00: Pitch Mastery & 90-Second Video
- [ ] Rehearse 3-minute stage pitch:
  - **Hook**: The real pain of rate limits.
  - **Demo**: 1-click capture ➔ Playwright teleport ➔ MCP terminal resume.
  - **Vision**: Universal OpenContext standard + Jev fast decision pipeline.
- [ ] Record a 90-second backup video showing end-to-end flow.

---

## 5. Hackathon Judging Matrix Alignment

| Hackathon Criterion | How ContextBridge Scores 10/10 |
|---|---|
| **Impact & Pain Point** | Solves an acute problem that judges face every single day (AI rate limits & vendor lock-in). |
| **Technical Depth** | Combines **Playwright automation**, **Model Context Protocol (MCP)**, **Chrome Extension**, and a formal **OpenContext JSON schema**. |
| **Innovation & Future Vision** | Introduces **System 1 (Jev TypeSafe) + System 2 (LLM)** dual-cognitive architecture for sub-second, zero-loss memory transfer. |
| **Stage Wow Factor** | Clicking one button and watching a fresh browser or terminal agent spring to life with full context without typing a word. |
