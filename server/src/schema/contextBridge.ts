import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const DecisionItemSchema = z.object({
  topic: z.string(),
  decision: z.string(),
  reason: z.string().optional(),
  rejectedAlternatives: z.array(z.string()).default([]),
});
export type DecisionItem = z.infer<typeof DecisionItemSchema>;

export const CodeSnippetSchema = z.object({
  filePath: z.string(),
  language: z.string().default('typescript'),
  snippet: z.string(),
  purpose: z.string().optional(),
});
export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;

export const ContextBridgeBundleSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  source: z.string().default('chatgpt-web'),
  project: z.object({
    name: z.string(),
    description: z.string().optional(),
    techStack: z.array(z.string()).default([]),
  }),
  activeGoal: z.string(),
  decisions: z.array(DecisionItemSchema).default([]),
  codeContext: z.object({
    activeFiles: z.array(z.string()).default([]),
    keySnippets: z.array(CodeSnippetSchema).default([]),
  }),
  rejectedPaths: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
  metrics: z.object({
    rawTurns: z.number().default(0),
    rawTokenEstimate: z.number().default(0),
    compressedTokenEstimate: z.number().default(0),
    savingsPercent: z.number().default(0),
  }),
});
export type ContextBridgeBundle = z.infer<typeof ContextBridgeBundleSchema>;
