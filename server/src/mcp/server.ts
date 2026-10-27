import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { ContextBridgeBundle } from '../schema/contextBridge.js';
import { formatHandoffMarkdown } from '../engine/distiller.js';

const STORAGE_DIR = path.resolve(process.cwd(), '.contextbridge');
const ACTIVE_FILE = path.join(STORAGE_DIR, 'active_context.json');

function loadActiveBundle(): ContextBridgeBundle | null {
  try {
    if (fs.existsSync(ACTIVE_FILE)) {
      const raw = fs.readFileSync(ACTIVE_FILE, 'utf-8');
      return JSON.parse(raw) as ContextBridgeBundle;
    }
  } catch (err) {
    console.error('Error reading active bundle:', err);
  }
  return null;
}

export function saveActiveBundle(bundle: ContextBridgeBundle): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  const markdown = formatHandoffMarkdown(bundle);
  fs.writeFileSync(ACTIVE_FILE, JSON.stringify(bundle, null, 2), 'utf-8');
  fs.writeFileSync(path.join(STORAGE_DIR, 'handoff.md'), markdown, 'utf-8');

  // Also auto-generate root instruction files recognized by OpenAI Codex, Cursor, and Claude agents
  try {
    const rootDir = process.cwd();
    // 1. CODEX.md / AGENTS.md for OpenAI Codex & Agent frameworks
    fs.writeFileSync(path.join(rootDir, 'CODEX.md'), markdown, 'utf-8');
    fs.writeFileSync(path.join(rootDir, 'AGENTS.md'), markdown, 'utf-8');
    // 2. CLAUDE.md for Claude Code CLI
    fs.writeFileSync(path.join(rootDir, 'CLAUDE.md'), markdown, 'utf-8');
  } catch (err) {
    console.warn('Note: Could not write workspace root instruction files:', err);
  }
}

export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'contextbridge-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_active_context',
          description:
            'Retrieves the distilled context, active goal, decisions made, code snippets, and next steps captured from the user browser or prior session.',
          inputSchema: {
            type: 'object',
            properties: {
              format: {
                type: 'string',
                enum: ['markdown', 'json'],
                description: 'Output format (default: markdown)',
              },
            },
          },
        },
        {
          name: 'get_decisions',
          description:
            'Retrieves all architectural decisions and rejected paths so the agent avoids re-proposing rejected options.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'save_checkpoint',
          description: 'Allows the agent to record progress or completed tasks back into the active context bridge.',
          inputSchema: {
            type: 'object',
            properties: {
              taskCompleted: { type: 'string', description: 'Description of the completed work' },
              nextAction: { type: 'string', description: 'Immediate next task for future handoff' },
            },
            required: ['taskCompleted'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const bundle = loadActiveBundle();

    if (name === 'get_active_context') {
      if (!bundle) {
        return {
          content: [
            {
              type: 'text',
              text: 'No active ContextBridge context found. Trigger capture from the browser extension or mock chat fixture first.',
            },
          ],
        };
      }

      const format = (args?.format as string) || 'markdown';
      if (format === 'json') {
        return {
          content: [{ type: 'text', text: JSON.stringify(bundle, null, 2) }],
        };
      }
      return {
        content: [{ type: 'text', text: formatHandoffMarkdown(bundle) }],
      };
    }

    if (name === 'get_decisions') {
      if (!bundle) {
        return {
          content: [{ type: 'text', text: 'No decisions currently recorded in ContextBridge.' }],
        };
      }
      const responseText = `## Recorded Architectural Decisions\n${bundle.decisions
        .map((d) => `- **${d.topic}**: ${d.decision} (Rejected: ${d.rejectedAlternatives.join(', ') || 'None'})`)
        .join('\n')}\n\n## Rejected Paths\n${bundle.rejectedPaths.map((p) => `- ❌ ${p}`).join('\n') || 'None'}`;

      return {
        content: [{ type: 'text', text: responseText }],
      };
    }

    if (name === 'save_checkpoint') {
      if (!bundle) {
        return {
          content: [{ type: 'text', text: 'Cannot save checkpoint: no active context bundle exists.' }],
        };
      }
      const taskCompleted = (args?.taskCompleted as string) || '';
      const nextAction = (args?.nextAction as string) || '';

      bundle.nextSteps = bundle.nextSteps.filter((s) => !s.toLowerCase().includes(taskCompleted.toLowerCase()));
      if (nextAction) {
        bundle.nextSteps.unshift(nextAction);
      }
      saveActiveBundle(bundle);

      return {
        content: [
          {
            type: 'text',
            text: `Checkpoint saved: "${taskCompleted}". Updated next steps: ${bundle.nextSteps.join(' -> ')}`,
          },
        ],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  });

  return server;
}

// Standalone execution entrypoint for MCP stdio transport
if (process.argv[1] && process.argv[1].endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error('Fatal MCP Server Error:', err);
    process.exit(1);
  });
}
