# ContextBridge: Locked Blueprint & Hackathon Implementation Spec

## 1. Locked Decisions Summary

| Dimension | Decision | Rationale |
|---|---|---|
| **Repository Structure** | **Clean 2-Folder (`server/` + `extension/`)** | Zero monorepo friction; each package runs independently with its own scripts. |
| **Hero Demo Flow** | **Web-to-Agent Handoff + File Export** | Active chat web tab -> Floating pill -> Local MCP Server -> Terminal/IDE agent (`claude`, `antigravity`, Cursor) + file download. |
| **Capture Strategy** | **Dual Strategy** | Live DOM content script observer with instant fallback drop/paste on the pill. |
| **Distillation Pipeline** | **Metadata-first LLM extraction** | Token-budgeted fast LLM (Gemini 2.5 Flash / Claude Haiku) using Zod. Does not swallow full noisy logs blindly — analyzes structural placement and extracts key decisions & code states. |
| **Agent Interface** | **Model Context Protocol (MCP)** | Standard stdio / HTTP SSE server exposing `get_active_context`, `get_decisions`, and `save_checkpoint`. |
| **Testing Setup** | **Local Mock Chat (`localhost:3000/mock-chat.html`) + live chatgpt.com** | Guarantees 100% demo uptime on stage even without internet, while also supporting live testing. |
| **Future Integration** | **Jev (TypeSafe AI)** | Sub-150ms non-autoregressive decision engine for System 1 triage, secret guards, and turn importance scoring. |

---

## 2. Project Layout (`d:\project\alan-hack`)

```
d:\project\alan-hack\
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── schema/
│   │   │   └── contextBridge.ts    # Zod schemas for .contextbridge & handoff
│   │   ├── engine/
│   │   │   ├── classifier.ts       # Layout selection & distillation logic
│   │   │   └── llm.ts              # Fast Flash/Haiku structured caller
│   │   ├── mcp/
│   │   │   └── server.ts           # MCP Server (stdio/sse)
│   │   ├── future/
│   │   │   └── jevEngine.ts        # Jev TypeSafe AI integration blueprint
│   │   ├── static/
│   │   │   └── mock-chat.html      # Offline demo test fixture
│   │   └── index.ts                # Fastify/Hono API server (receives capture)
│   └── .env.example
│
├── extension/
│   ├── package.json
│   ├── vite.config.ts
│   ├── manifest.json               # Chrome Manifest V3
│   └── src/
│       ├── content/
│       │   ├── pill.tsx            # Floating ambient in-page widget
│       │   ├── scraper.ts          # DOM parser for ChatGPT/Claude/Mock
│       │   └── index.ts            # Content script entry
│       ├── popup/
│       │   └── App.tsx             # Extension popup (status & direct export)
│       └── background/
│           └── index.ts            # Service worker
│
└── README.md
```

---

## 3. Immediate Implementation Steps

1. **Step 1: Backend & MCP Engine (`server/`)**:
   - Initialize `server/package.json` and install `@modelcontextprotocol/sdk`, `zod`, `hono` (or `fastify`), `@google/genai` (or Anthropic SDK).
   - Implement `schema/contextBridge.ts` with strict typed structures.
   - Build `mcp/server.ts` exposing `get_active_context`, `get_decisions`, and `save_checkpoint`.
   - Create `static/mock-chat.html` for instant testing.
2. **Step 2: Chrome Extension (`extension/`)**:
   - Initialize Vite + React + Tailwind + CRXJS or WXT.
   - Build the floating ambient pill injected into `chatgpt.com`, `claude.ai`, and `http://localhost:3000/*`.
   - Wire the pill's button to extract messages and `POST` to the local server.
3. **Step 3: Verification & Polish**:
   - Test capture on `mock-chat.html`.
   - Run MCP server and connect with Claude Code / Antigravity terminal agent to verify live retrieval.
