import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChatMessageSchema, ContextBridgeBundle } from './schema/contextBridge.js';
import { distillConversation, formatHandoffMarkdown } from './engine/distiller.js';
import { saveActiveBundle } from './mcp/server.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

// Enable CORS for Chrome Extension content scripts and local web pages
app.use('/*', cors());

// 1. Serve Mock Chat Test Fixture
app.get('/mock-chat.html', (c) => {
  const filePath = path.join(__dirname, 'static', 'mock-chat.html');
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf-8');
    return c.html(html);
  }
  return c.text('Mock chat file not found', 404);
});

// 2. Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', service: 'ContextBridge Orchestrator', timestamp: new Date().toISOString() });
});

// 3. Ingestion endpoint from Chrome Extension
const CapturePayloadSchema = z.object({
  source: z.string().default('unknown'),
  messages: z.array(ChatMessageSchema),
});

app.post('/api/capture', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = CapturePayloadSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid payload format', details: parsed.error.issues }, 400);
    }

    const { messages, source } = parsed.data;
    if (messages.length === 0) {
      return c.json({ error: 'No messages provided to distill' }, 400);
    }

    console.log(`[ContextBridge] Ingesting ${messages.length} turns from ${source}...`);
    const bundle: ContextBridgeBundle = await distillConversation(messages, source);

    // Save to local storage for MCP server & IDE access
    saveActiveBundle(bundle);

    return c.json({
      success: true,
      message: 'Conversation distilled and active context updated',
      bundle,
      handoffMarkdown: formatHandoffMarkdown(bundle),
    });
  } catch (err: any) {
    console.error('[ContextBridge] Extraction Error:', err);
    return c.json({ error: 'Failed to process conversation', message: err.message }, 500);
  }
});

// 4. Read active bundle
app.get('/api/context/active', (c) => {
  const activePath = path.resolve(process.cwd(), '.contextbridge', 'active_context.json');
  if (fs.existsSync(activePath)) {
    const raw = fs.readFileSync(activePath, 'utf-8');
    return c.json(JSON.parse(raw));
  }
  return c.json({ status: 'empty', message: 'No active context recorded yet' }, 404);
});

// 5. Download Handoff Markdown
app.get('/api/context/export/markdown', (c) => {
  const mdPath = path.resolve(process.cwd(), '.contextbridge', 'handoff.md');
  if (fs.existsSync(mdPath)) {
    const md = fs.readFileSync(mdPath, 'utf-8');
    return c.text(md, 200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="contextbridge-handoff.md"',
    });
  }
  return c.text('# No Context Available', 404);
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3100;
console.log(`\n🌉 ContextBridge Local Engine running on http://localhost:${PORT}`);
console.log(`👉 Mock Chat Test Fixture: http://localhost:${PORT}/mock-chat.html`);
console.log(`👉 MCP Server ready: stdio transport configured in src/mcp/server.ts\n`);

serve({
  fetch: app.fetch,
  port: PORT,
});
