# 🌉 ContextBridge

> **Ambient AI Memory & Cross-Agent Handoff**  
> Carry your project context seamlessly across AI web chats (ChatGPT, Claude, Gemini) and coding agents (OpenAI Codex, Claude Code, Cursor, Antigravity) without re-explaining or starting over.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Protocol](https://img.shields.io/badge/Protocol-Model%20Context%20Protocol%20(MCP)-8A2BE2.svg)](https://modelcontextprotocol.io/)
[![LLM: Google Gemini](https://img.shields.io/badge/Distillation-Gemini%203.5%20%2F%203.8%20Flash-4285F4.svg)](https://aistudio.google.com/)
[![Extension: Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-34A853.svg)](#)

---

## 🎯 The Problem

1. **Context Fragmentation**: Developers brainstorm and plan architectures in web chats (ChatGPT, Claude), then switch to terminal tools or IDEs (Codex, Cursor, Claude Code) — having to re-explain everything.
2. **Rate Limits & Trapped Memory**: When you hit a model tier limit mid-sprint (*"You've reached your limit until 4 PM"*), progress freezes.
3. **Conversational Bloat**: Raw transcripts are huge (30,000+ tokens) and filled with conversational filler, making them expensive and noisy to paste into another AI.
4. **Repeated Mistakes**: New models frequently suggest options you already tried, tested, and rejected earlier.

---

## 💡 The Solution

**ContextBridge** acts as an **ambient, persistent cognitive memory layer**:
- 🌐 **Lives Where You Work**: An ambient floating pill injected into ChatGPT, Claude, and Gemini web pages.
- 🧠 **AI Cognitive Distillation**: Analyzes multi-turn conversations using Google Gemini (`gemini-3.5-flash`), eliminating **75% to 90% of token waste** while preserving 100% of architectural fidelity.
- 🚫 **Tracks Rejected Alternatives**: Keeps an explicit ledger of discarded paths so subsequent agents never repeat your past mistakes.
- 🔌 **Universal Agent Interoperability**: 
  - Exposes an official **Model Context Protocol (MCP)** server for terminal & IDE agents.
  - Automatically writes structured instruction files: **`CODEX.md`**, **`AGENTS.md`**, and **`CLAUDE.md`**.
  - Organizes deep context into segmented subfolders (`context/` and `memory/`).

---

## 🏗️ Architecture & Context Hierarchy

```
Browser (ChatGPT / Claude / Gemini / Mock)
      │
      ▼ (Ambient Floating Pill Click)
Local ContextBridge Engine (:3100)
      │
      ├──► Gemini 3.5 Flash Cognitive Distillation
      │
      ▼
Universal Bundle Directory (~/.contextbridge/ & ./.contextbridge/)
├── active_context.json         # Master JSON state machine
├── handoff.md                  # Unified human-readable summary
├── CODEX.md                    # OpenAI Codex instruction guide
├── AGENTS.md                   # Multi-agent prompt file
│
├── context/                    # 📂 Deep Context Subfolder (Pro Max)
│   ├── 01-project-overview.md  # Active goal & tech stack
│   ├── 02-decisions-log.md     # Decisions, rationale & alternatives
│   ├── 03-rejected-paths.md    # Explicit blacklist of discarded options
│   ├── 04-code-and-files.md    # Referenced code snippets & files
│   └── 05-next-steps.md        # Numbered execution roadmap
│
└── memory/                     # 📂 Machine-Readable Memory
    ├── facts.json              # Immutable project facts
    └── decisions.json          # Structured decision array
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v20+
- A Google Gemini API key (Free at [Google AI Studio](https://aistudio.google.com/))

### 1. Configure & Start the Local Engine

```bash
cd server
npm install
```

Create a `.env` file in `server/.env`:
```env
PORT=3100
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the engine:
```bash
npm start
```

*Endpoints:*
- **Engine Health**: `http://localhost:3100/api/health`
- **Offline Zero-Fail Test Fixture**: `http://localhost:3100/mock-chat.html`
- **Markdown Export**: `http://localhost:3100/api/context/export/markdown`

---

### 2. Build & Load the Chrome Extension

```bash
cd extension
npm install
npm run build
```

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked** and select the folder:
   ```text
   d:\project\alan-hack\extension\dist
   ```
4. ContextBridge is now active!

---

## 🎮 How to Demo & Use

### Step 1: Brainstorm in Your Browser
Open [http://localhost:3100/mock-chat.html](http://localhost:3100/mock-chat.html), `https://chatgpt.com`, or `https://claude.ai`.

Look at the **bottom-right corner** for the ambient floating pill:
```text
[ 🌉 ContextBridge [4t]  |  ⚡ Send to IDE (MCP)  |  📥 .md  |  📋 ]
```

### Step 2: Bridge Context in One Click
Click **`⚡ Send to IDE (MCP)`**.
- ContextBridge captures turns from the active DOM.
- Gemini distills goals, tech stack, choices, and rejected paths.
- The pill turns green: `✓ Synced to MCP (79% saved)`.
- Click the extension icon in Chrome's toolbar to see live metrics and download `handoff.md`.

---

### Step 3: Connect Coding Agents

#### Option A: OpenAI Codex (Desktop App)
ContextBridge automatically writes **`CODEX.md`** globally (`~/.contextbridge/CODEX.md` and `~/CODEX.md`).

1. In OpenAI Codex Settings ➔ **MCP Servers**, add:
   - **Command**: `node`
   - **Arguments**: `D:\project\alan-hack\server\dist\mcp\server.js`
   - **Working Directory**: `D:\project\alan-hack\server`
2. In Codex chat, prompt:
   > *"Read `~/.contextbridge/CODEX.md` and implement Next Step 1."*
   *(or ask Codex to call `get_active_context` via MCP).*

#### Option B: Cursor / Windsurf / Antigravity (MCP)
Add ContextBridge to your IDE's MCP configuration (`mcpServers`):
```json
{
  "mcpServers": {
    "contextbridge": {
      "command": "node",
      "args": ["d:/project/alan-hack/server/dist/mcp/server.js"]
    }
  }
}
```
Ask your agent: *"Call `get_active_context` and resume our task."*

#### Option C: Claude Code (Terminal CLI)
ContextBridge generates `CLAUDE.md` automatically in the project directory, so Claude Code immediately detects project rules upon startup.

---

## 🛠️ MCP Tools Reference

The ContextBridge Model Context Protocol server exposes:

| Tool | Parameters | Description |
|---|---|---|
| `get_active_context` | `format: 'markdown' \| 'json'` | Returns distilled active goal, tech stack, code state, and next steps. |
| `get_decisions` | *none* | Returns all architectural decisions and explicit rejected paths. |
| `save_checkpoint` | `taskCompleted: string`, `nextAction?: string` | Allows agents to record completed work and update next steps back into the memory bridge. |

---

## 🔮 Future Integration: Jev (TypeSafe AI)

See [`server/src/future/jevEngine.ts`](server/src/future/jevEngine.ts) for our **System 1 Fast Decision Engine** blueprint.  
Using TypeSafe AI's `@typesafe-ai/sdk`, Jev provides:
- **Sub-150ms Non-Autoregressive Routing**: Categorizes chat mode (`coding`, `debugging`, `architecture`) using typed `choice` primitives.
- **Zero-Hallucination Secret Guard**: Employs mathematical `noul` (boolean) checks to prevent API key leaks.
- **Granular Token Budget Scoring**: Uses `score` primitives to rank message importance before LLM synthesis.

---

## 📜 License

MIT License. Built for modern AI-assisted software engineering.
