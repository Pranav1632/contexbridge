# ContextBridge 2.0 — Architecture & Stack Overhaul

## 1. Why Playwright / Headless Scrapers are Risky vs. How to Use Them Right

If you try to run **Playwright directly against live authenticated ChatGPT/Claude web sessions** during a 24h hackathon demo:
- **Cloudflare & Bot Challenges**: ChatGPT and Claude actively block automated browsers (Playwright/Puppeteer) with Turnstile / Cloudflare challenges unless you manage complex stealth plugins and cookie synchronization.
- **Login Friction**: You cannot easily log in to Google/Apple Auth in automated headless sessions on a stage demo.

### The Winning Solution: Dual-Engine Capture

Instead of fighting Cloudflare or brittle DOM scraping, we use a **3-tier capture pipeline**:

```
[1. Extension / Hook] ──┐
                         ├──► [Local Orchestrator API (FastAPI / Express)] ──► [LLM Brain + SQLite/Vector]
[2. Clipboard / Bridge] ─┤                                                        │
[3. Playwright Local]   ──┘                                                        ▼
                                                                           [Target Injections]
                                                                  - MCP Server (Claude Code / Antigravity / Cursor)
                                                                  - Auto-fill via Playwright (destination chat)
                                                                  - Direct IDE File Writers (.contextbridge, CLAUDE.md)
```

1. **Input Capture**:
   - **Chrome Extension / Tampermonkey / Bookmarklet (Zero-Friction Capture)**: Reads the active authenticated tab's DOM instantly in 1 click (no Cloudflare issues, works while logged in).
   - **Playwright Local Worker (Automation & Export parsing)**:
     - Automatically logs into local mock chats or handles automated downloading of official chat export files.
     - **The Killer Hack for Playwright**: Use Playwright **not to scrape, but to INJECT and AUTOMATE the target destination**! (e.g., Playwright automatically opens a fresh browser, launches Gemini or Claude, and injects the distilled context hands-free!).
2. **Local Processing Engine**:
   - Python FastAPI or Node.js Hono/Express.
   - Pydantic / Zod for structured context schema validation.
   - Fast LLM (Gemini 2.5 Flash / Claude 3.5 Haiku) for instant classification, decision extraction, and token budget compression.
3. **Distribution & Injection**:
   - **Local MCP Server** (stdio/SSE): Connects terminal agents (Claude Code, Antigravity, Cursor, Windsurf).
   - **Target Auto-Paste / Playwright Bot**: Hands-free resumption in browser.
   - **Repository Injection**: Writes `.contextbridge/handoff.md`, `CLAUDE.md`, or rules directly into workspace repos.

---

## 2. Rebuilt Tech Stack for Maximum 24-Hour Hackathon Velocity

| Layer | Recommended Choice | Why it's best for a 24-Hour Hackathon |
|---|---|---|
| **Core Backend & MCP** | **TypeScript (Node.js) or Python (FastAPI)** | `TypeScript` gives you native MCP SDK compatibility and easy Chrome Extension sharing. |
| **Automation & E2E** | **Playwright (Chromium)** | Automates the **destination** injection: opens target AI (e.g., ChatGPT/Gemini), starts a new session, injects handoff context automatically. |
| **Fast LLM Extractor** | **Gemini 2.5 Flash / Claude 3.5 Haiku** | Blazing fast (under 1.2s extraction time), dirt cheap, highly accurate structured JSON output. |
| **Capture Layer** | **V3 Chrome Extension + Clipboard Watcher** | Captures active logged-in chat with a single keyboard shortcut (`Ctrl+Shift+C`) or extension icon. |
| **Frontend UI** | **Next.js / Vite + React + Tailwind + Lucide** | High-aesthetic dashboard: Live Token Savings Gauge, Interactive Decision Tree, One-Click Bridge launcher. |
| **Storage / Sync** | **SQLite + File System (`.contextbridge/`)** | Zero configuration, offline resilience (guaranteed not to fail if stage Wi-Fi lags). |

---

## 3. The "Killer Demo Flow" (Showcasing Playwright + MCP)

```
[ChatGPT Web Chat Hits Limit] 
       │
       ▼ (User presses extension button: "Bridge Context")
[ContextBridge Local Engine]
       │
       ├──► Extracts Decisions, Code State, Rejected Paths, Next Steps
       ├──► Reduces 25,000 tokens ➔ 2,800 tokens (89% compression)
       │
       ├──► [Path A: Browser Auto-Pilot via Playwright]
       │    Playwright opens Gemini/Claude Web, enters prompt, resumes discussion automatically.
       │
       └──► [Path B: Terminal / IDE Agent via MCP]
            User runs `claude` or `antigravity` in terminal; the agent queries MCP:
            "I loaded ContextBridge session #42. Resuming task: Auth middleware test..."
```

---

## 4. 24-Hour Action Plan Breakdown

### Block 1 (Hours 0 - 6): Core Engine & Schema
- [ ] Initialize repository structure (`packages/core`, `packages/mcp`, `packages/extension`, `packages/automation`).
- [ ] Define the `ContextBridgeSchema`:
  - `project`: name, repo path, tech stack.
  - `active_goal`: current objective.
  - `decisions`: rationale, rejected alternatives.
  - `code_context`: files touched, snippets, environment variables.
  - `blockers_and_next_steps`: explicit next actions.
- [ ] Implement the LLM extraction prompt with schema enforcement.

### Block 2 (Hours 6 - 12): Capture & Playwright Automation
- [ ] Build Chrome extension content script to extract chat turns from ChatGPT/Claude.
- [ ] Build Playwright injection script: takes distilled context and injects it into a fresh AI web tab with one command.
- [ ] Build standard local MCP server (`get_context`, `save_checkpoint`).

### Block 3 (Hours 12 - 18): Visual Dashboard
- [ ] Interactive UI showing:
  - Token compression counter.
  - Visual decision timeline.
  - Target selector (Claude Code, Cursor, ChatGPT, Gemini).
  - Quick action buttons (Copy MD, Launch Playwright, Start MCP).

### Block 4 (Hours 18 - 24): Battle-Testing & Pitch Mastery
- [ ] Polish live presentation demo and edge case fallbacks.
- [ ] Pre-record high-resolution 60-second backup video.
- [ ] Package 3-minute pitch emphasizing **Vendor Freedom**, **Zero Context Loss**, and **Developer Velocity**.
