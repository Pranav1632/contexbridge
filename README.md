# 🌉 ContextBridge

> **Ambient AI Memory & Cross-Agent Handoff**  
> Never lose your project context when switching between ChatGPT, Claude, Gemini, and your terminal/IDE coding agents (Claude Code, Antigravity, Cursor).

---

## 🚀 Quickstart

### 1. Start the Local Context Engine & MCP Provider
```bash
cd server
npm install
npm run dev
```
- **Local Engine & API**: `http://localhost:3000`
- **Offline Zero-Fail Demo Fixture**: `http://localhost:3000/mock-chat.html`

### 2. Build & Load the Chrome Extension
```bash
cd extension
npm install
npm run build
```
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the `extension/dist` folder.

---

## 🎯 The Hero Workflow

1. **Ambient Capture in Browser**:
   - Open [http://localhost:3000/mock-chat.html](http://localhost:3000/mock-chat.html) (or `chatgpt.com` / `claude.ai`).
   - Notice the ambient floating widget: `🌉 ContextBridge [4 turns]`.
   - Click **`⚡ Send to IDE (MCP)`**.
   - ContextBridge distills active goals, decisions made, rejected paths, and code snippets in under 1 second.

2. **Resume in Terminal / Coding Agent via MCP**:
   - Connect your IDE or terminal agent (`claude`, `antigravity`, `cursor`) to the ContextBridge MCP server:
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
   - In terminal, ask: *"Resume our task using ContextBridge context"*.
   - The agent automatically calls `get_active_context` and picks up directly without re-explaining!

3. **Instant File Handoff**:
   - Download the clean handoff anytime via `http://localhost:3000/api/context/export/markdown`.

---

## 🧠 Future Integration: Jev (TypeSafe AI)

See `server/src/future/jevEngine.ts` for the complete architecture and System 1 decision engine design using `@typesafe-ai/sdk`.
