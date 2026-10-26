# ContextBridge — 24-Hour Hackathon Strategy & Execution Plan

## 1. Idea Analysis & Reliability Assessment

### What Works Exceptionally Well
1. **High Emotional Resonance for Hackathon Judges**: Every developer, judge, and AI power-user has experienced context loss due to rate limits ("You've reached your limit with Claude 3.7 Sonnet..."). The problem is visceral, immediate, and universally understood.
2. **Standardization as a Narrative**: Vendor lock-in between OpenAI, Anthropic, Gemini, and local coding tools is huge. Presenting ContextBridge as the **"POSIX / Open Standard for AI Memory"** (like OpenTelemetry for LLM contexts) creates high prestige in judging rounds.
3. **Multi-Modal Handoff (Chat & Agentic CLI)**: Bridging browser chat (ChatGPT/Claude web) directly into a terminal or IDE agent (Claude Code, Cursor, Antigravity) is a stellar "aha!" demo moment.

### Reliability & Feasibility Reality Check
| Risk Factor | Reality in a 24-Hour Build | Mitigation / Hackathon Fix |
|---|---|---|
| **DOM Scraping Brittleness** | Web chat DOMs change constantly and scraping can break live during a demo. | Build **one rock-solid Chrome Extension content script / clipboard hook** for ChatGPT or Claude, with a **fallback "One-Click Bookmarklet / Copy Chat"** or pasting export/JSON. |
| **Hallucination & Context Loss** | LLMs summarizing long chats often drop vital architectural decisions or code snippets. | Use **Deterministic Extraction + LLM Structuring**: regex/AST for code snippets and tool outputs, LLM strictly for intent/decision graphs. |
| **Token Budget Overshoot** | Feeding the whole raw transcript into the next model blows context and costs money. | Implement dynamic tiering: `Tier 1: Instant Resume (< 2k tokens)`, `Tier 2: Full State (< 10k tokens)`. |
| **Over-Engineering Scope** | A 7-week roadmap (Week 1–7) cannot be built in 24 hours. | **Ruthlessly collapse the stack** into a single working pipeline with high visual demo fidelity. |

---

## 2. The 24-Hour Hackathon Execution Plan (Hour-by-Hour)

```
[Hours 00-04] Spec & Unified Engine  ───►  [Hours 04-10] Capture & MCP Server
                                                    │
[Hours 18-24] Polish, Live Demo & Pitch ◄─── [Hours 10-18] Web UI / Extension & Test
```

### Phase 1: Core Engine & Bridge Specification (Hours 0 - 4)
- **Unified TypeScript/Node.js CLI & Core Library**:
  - Define `contextbridge.json` schema (Goal, Decision Log, Current Code State, Blockers, Stack, Memory).
  - Parser/extractor script using a fast LLM call (e.g. Gemini 2.5/3.5 Flash or Claude 3.5 Haiku) with strict structured JSON output (`zod`).
  - Output generators:
    1. `handoff.md` (Markdown for ChatGPT / Claude Web).
    2. `.contextbridge/` or `CLAUDE.md` / `AGENTS.md` (for Cursor / Claude Code / Antigravity).

### Phase 2: Capture Layer & Injection / MCP Server (Hours 4 - 10)
- **Capture Channel (Choose the most reliable 1-2)**:
  - **Option A (Instant Demo)**: Chrome Extension popup with a "Capture Chat" button that grabs the current DOM messages and sends them to the local backend.
  - **Option B (Zero-fail fallback)**: A sleek Web Dropzone UI: paste chat URL, drop raw chat JSON/MD, or hotkey `Ctrl+A, Ctrl+C` into a capture box.
- **Fast MCP Server**:
  - Lightweight stdio/SSE server exposing:
    - `get_active_context()`: returns current goal, decisions, and files.
    - `save_checkpoint(action, notes)`: saves current progress back into the bridge.

### Phase 3: "Magic Moment" UI / Extension (Hours 10 - 16)
- Chrome Extension or Standalone Floating Widget:
  - Status chip: "🟢 ContextBridge: 14 Turns Captured".
  - One-Click **"Teleport to..."**:
    - [⚡ Switch to Claude Code CLI]
    - [⚡ Switch to ChatGPT Web]
    - [⚡ Switch to Cursor / Antigravity]
- Visual **Decision Graph & Diff Viewer**: Displays what decisions were made and why rejected paths were dropped.

### Phase 4: Battle-Testing & Zero-Fail Demo Safeguards (Hours 16 - 20)
- Prepare a pre-recorded mock conversation hitting a rate limit mid-feature.
- Ensure the MCP server and CLI seamlessly run in a fresh terminal folder without environment quirks.
- Offline backup dataset ready in case conference Wi-Fi lags.

### Phase 5: Pitch Deck, Demo Video & Polish (Hours 20 - 24)
- 3-Minute pitch script tailored to hackathon criteria.
- 90-second crisp demo recording (vital as backup if live presentation Wi-Fi drops).

---

## 3. How to Make This a Hackathon Winner (Winning Differentiators)

To win, judges need to see **immediate utility, technical depth, and a memorable stage hook**.

### 1. The "Rate Limit Drop" Stage Hook (Emotional Demo)
- **Start the presentation with an actual fail**:
  > *"You are building an app with ChatGPT. Turn 28: 'You have reached your limit until 4:00 PM.' Total silence. Code half-written."*
- Click **one button** on ContextBridge.
- Open a brand-new terminal window with `Claude Code` or a fresh ChatGPT window.
- The new agent immediately answers: *"I see we hit a limit while debugging the auth JWT verification in `auth.ts`. Let's finish implementing the refresh token handler..."*
- **Judges will instantly applaud because they suffer this problem daily.**

### 2. "Zero Loss" Semantic Diff (Visual Wow Factor)
Don't just spit out plain text. Render an interactive visual UI:
- **Decisions Log**: "Why we chose SQLite over Redis" (with direct links back to chat turns).
- **Rejected Alternatives**: Avoids the next model re-suggesting code you already rejected!
- **Token Compression Gauge**: "Original context: 38,000 tokens (89% savings) ➔ Compressed Bridge: 4,100 tokens".

### 3. Cross-Paradigm Bridge (Browser Web Chat ➔ Terminal Coding Agent)
Most tools only copy Web ➔ Web. If your tool captures a discussion from **ChatGPT Web** and exports it directly as an active configuration (`CLAUDE.md` + MCP server) that **Claude Code / Cursor / Antigravity CLI** automatically detects in terminal, you bridge two completely different developer worlds.

### 4. Open Standard Pitch ("OpenContext Protocol / .contextbridge")
Frame your schema as an open-source standard for multi-agent interoperability. Judges love open-source standardization projects.

---

## 4. Minimum Viable Tech Stack (Fastest 24h Setup)

- **Language / Runtime**: Node.js / TypeScript (unified across backend, extension, and MCP server).
- **Frontend / Extension**: Vite + React + Tailwind CSS + Lucide Icons (clean, modern dark-mode aesthetic).
- **LLM Engine for Distillation**: Gemini 2.5 Flash / Claude 3.5 Haiku API (sub-second response, costs pennies).
- **Local Storage**: Simple local JSON/Markdown directory in `~/.contextbridge/projects/`.
