# ContextBridge: Definite Tech Stack & Jev (TypeSafe AI) Integration

## 1. Chosen Tech Stack (Engineered for a 24-Hour Win)

To win a 24-hour hackathon, every technology in your stack must serve two purposes: **extreme developer velocity** (no fighting mismatched types/setups) and **high judge appeal**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPTURE & INTERFACE LAYER                       │
│  - Chrome Extension (Manifest V3): React + Vite + Tailwind             │
│  - Playwright CLI: Auto-pilot browser launcher & chat injector         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE PROCESSING ENGINE                          │
│  - Runtime: Node.js 20+ / TypeScript (Unified end-to-end)               │
│  - Web Framework: Fastify / Hono (Ultra-fast, zero bloat)              │
│  - Validation: Zod (Strict TypeScript contract for Context schema)     │
│  - Distillation LLM: Gemini 2.5 Flash / Claude 3.5 Haiku API           │
│  - Storage: SQLite (better-sqlite3) + Flat Markdown/JSON files        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       INTEROPERABILITY & HANDOFF                       │
│  - Model Context Protocol (MCP): Official @modelcontextprotocol/sdk    │
│  - Target Format Exporters:                                            │
│      * CLAUDE.md / AGENTS.md (for IDEs: Cursor, Windsurf, Antigravity) │
│      * handoff.md (for ChatGPT, Gemini, Claude Web)                    │
│      * .contextbridge/manifest.json (OpenContext standard)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Incorporating Jev (TypeSafe AI)

### What is Jev?
**Jev** (by TypeSafe AI, `@typesafe-ai/sdk`) is a non-autoregressive "System One" decision model. Instead of streaming text like ChatGPT, it evaluates software state and answers typed queries (`noul` for boolean/probabilities, `choice` for enum routing, `score` for continuous ratings) in **70ms–200ms**.

### Why Jev is a Killer Fit for ContextBridge:
In Section 4 of your idea doc, you outlined:
> *"The agent does not use a fixed template. It first classifies the chat, then picks a layout: Idea/Planning, Coding, Learning, Research, Debugging."*

Standard generative LLMs take 2–4 seconds just to classify and route a document. **Jev executes this in under 150ms with 100% type safety**.

### Integration Architecture:
```typescript
import { choice, noul, score, TypeSafeClient } from '@typesafe-ai/sdk';

// 1. Instant Sub-200ms Classification
const { answers } = await client.systemOne({
  state: chatTranscriptExcerpt,
  questions: {
    // Choice primitive: picks layout template instantly
    chat_type: choice("What is the primary activity of this conversation?", {
      coding: "Writing, refactoring, or building software",
      debugging: "Investigating bug reports, errors, stack traces",
      architecture: "System design, database modeling, tech stack decisions",
      general: "General planning and open research"
    }),
    
    // Noul (Boolean) primitive: detects sensitive credentials
    has_secrets: noul("Does the transcript contain API keys, passwords, or secrets that must be redacted?"),
    
    // Score primitive: priority ranking for token budget pruning
    importance_density: score("Rate the density of architectural decisions made (1 = chit-chat, 5 = critical system rules)")
  }
});
```

### Strategic Placement:
- **Now (Hackathon Demo)**: Feature Jev in your slides and architecture diagram as the **"System 1 Fast Classifier & Redactor"** (Sub-150ms Decision Engine), while using Flash LLM for the generative summary. If you have an API key, drop it in directly.
- **Future Integration**: Full token-budget optimization where Jev scores every single chat message's importance score to fit into 8k/32k token windows without running heavy generative models.

---

## 3. The 3-Minute Winning Pitch Matrix

1. **The Problem Hook (0:00 - 0:45)**:
   - "Every developer hits rate limits. When your context drops mid-feature, you spend 20 minutes copying code, re-explaining architecture, and dealing with hallucinated repeats."
2. **The Product Demo (0:45 - 2:00)**:
   - Live browser: ChatGPT hits a wall.
   - Click **ContextBridge**: Under 1 second, it classifies the chat, extracts decisions & rejected options, strips secrets, and creates an OpenContext bundle.
   - **Playwright Auto-Pilot kicks in**: A fresh browser opens Gemini/Claude, automatically pastes the context, and continues coding hands-free.
   - **Terminal Agent**: Run `claude` or `antigravity` in terminal — the MCP server instantly equips the agent with full project memory.
3. **The Vision & Open Standard (2:00 - 3:00)**:
   - Present `.contextbridge` as the universal open format for agent state handoffs.
   - Mention Jev TypeSafe AI integration for instant sub-second edge classification and zero-loss decision routing.
