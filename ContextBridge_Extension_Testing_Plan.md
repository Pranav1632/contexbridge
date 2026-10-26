# Extension Development & Live Testing Architecture

## 1. The Core Philosophy: "Always Where the User Is" (Ambient & Continuous)

Instead of relying solely on an artificial "rate limit hit" trigger, ContextBridge is an **Ambient AI Copilot & Memory Bridge**:

- **Continuous Awareness**: As the user plans or codes across ChatGPT, Claude, Gemini, or GitHub, the extension operates quietly in the background.
- **On-Demand Memory Teleport**: At *any* moment (not just when blocked), the user can:
  - Bring their browser conversation into their IDE / Terminal Agent (`claude`, `cursor`, `antigravity`).
  - Cross-consult another model ("Get a second opinion from Gemini on this Claude architecture").
  - Save a permanent project milestone / checkpoint into `.contextbridge/`.

---

## 2. Tools & Stack for Building & Testing the Chrome Extension

To build and test a Chrome Extension rapidly within a 24-hour hackathon, we use modern tooling that provides **Hot Module Replacement (HMR)** and **automated end-to-end testing**:

| Tool | Role | Why It's the Best Choice |
|---|---|---|
| **WXT (Next-gen Web Extension Framework)** or **CRXJS (Vite plugin)** | Build tool & Dev Server | Brings standard Vite + React + Tailwind into Chrome extensions with **instant HMR**. You edit code, and the extension reloads automatically without manual repackaging. |
| **Playwright with Chromium Extension Loading** | Automated Testing & Live Verification | Playwright can launch a real browser with `--load-extension` flags. You can test your extension capturing real chat DOMs automatically in CI/scripts! |
| **Chrome Developer Mode (`chrome://extensions`)** | Manual Live Testing | Load unpacked directory (`dist/`). One-click refresh button for rapid manual validation on live ChatGPT/Claude tabs. |
| **Mock Chat Fixtures (Local HTML pages)** | Zero-Internet / Offline Fallback | Local HTML clones of chat interfaces so you can test and demonstrate even without internet connection or API throttling. |

---

## 3. How Playwright Tests the Extension End-to-End

Playwright natively supports loading unpacked extensions during testing:

```typescript
// tests/extension.spec.ts
import { test, chromium } from '@playwright/test';
import path from 'path';

test('Extension captures active conversation and streams to local engine', async () => {
  const pathToExtension = path.resolve(__dirname, '../packages/extension/dist');
  
  const context = await chromium.launchPersistentContext('', {
    headless: false, // Extensions only work in headful mode
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await context.newPage();
  
  // 1. Navigate to live chat or mock chat fixture
  await page.goto('http://localhost:3000/mock-chat.html');

  // 2. Trigger extension action (or content script floating widget)
  await page.click('#contextbridge-quick-capture');

  // 3. Verify context is captured and emitted to the local bridge engine
  const status = await page.locator('#contextbridge-status').innerText();
  console.log('Capture status:', status);

  await context.close();
});
```

---

## 4. In-Page UX: Floating Ambient Widget ("Where the User Is")

Instead of burying the extension inside Chrome's tiny top-right puzzle menu, the content script injects a sleek, minimal **floating pill** directly onto ChatGPT, Claude, and Gemini web pages:

```
┌─────────────────────────────────────────────────────────────┐
│  ChatGPT / Claude Active Tab                                │
│                                                             │
│   [Assistant Response...]                                   │
│   "Here is how we implement the authentication service..."  │
│                                                             │
│                                                             │
│         ┌───────────────────────────────────────────────┐   │
│         │ 🌉 Bridge [ 12 turns ]  | ⚡ Send to IDE Agent │   │
│         └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

1. **Ambient Turn Counter**: Shows real-time token/turn tracking directly inside the active chat page.
2. **One-Click Actions**:
   - `⚡ Send to Terminal (MCP)`: Immediately generates/updates `.contextbridge/handoff.md` and notifies local MCP server.
   - `🔄 Consult Another Model`: Instantly opens target model with full context.
   - `💾 Snapshot Milestone`: Saves a checkpoint to the project memory graph.
