/**
 * Lucy Tool System - Types + Tool Registry
 * Defines tools, agent steps, message formats, and a central tool config map.
 */

/** All valid tool names Lucy's agent can call */
export type LucyToolName =
  | "chat"
  | "vision"
  | "web_search"
  | "code_exec"
  | "image_gen"
  | "browser_fetch"
  | "memory_search"
  | "reasoning";

/** A single tool call with arguments */
export type LucyToolCall = {
  tool: LucyToolName;
  arguments: Record<string, any>;
};

/** One step in the agent's reasoning / tool plan */
export type LucyAgentStep = {
  stepNumber: number;
  toolCall: LucyToolCall;
  toolResult?: any;
  notes?: string;
  durationMs?: number;
};

/** Full agent plan + final answer */
export type LucyAgentPlan = {
  finalAnswer?: string;
  steps: LucyAgentStep[];
  continue?: boolean;
  persona?: string;
  confidence?: number;
};

/** Basic chat / tool messages used in the agent pipeline */
export type LucyMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolName?: LucyToolName;
  toolResultJson?: any;
  timestamp?: string;
};

/** Result shape for browser fetch tool */
export type BrowserFetchResult = {
  url: string;
  title: string;
  textPreview: string;
  success: boolean;
};

/** Result shape for code execution tool */
export type CodeExecutionResult = {
  ok: boolean;
  stdout: string;
  result?: any;
  error?: string;
  durationMs: number;
};

/** Stored memory record shape */
export type MemoryRecord = {
  id: string;
  userId: string;
  summary: string;
  embedding?: number[];
  persona?: string;
  createdAt: string;
};

/**
 * Configuration for a single Lucy tool.
 * path: Supabase Edge Function path under /functions/v1
 * method: HTTP method used to call the tool
 */
export type LucyToolConfig = {
  path: string;
  method: "GET" | "POST";
};

/**
 * Central registry: which Edge Function each tool name maps to.
 * Adjust paths here if your function names differ.
 */
export const LUCY_TOOL_CONFIGS: Record<LucyToolName, LucyToolConfig> = {
  chat: {
    // Core chat / router entrypoint (update if you use a different function name)
    path: "/functions/v1/lucy-router",
    method: "POST",
  },
  vision: {
    // Vision / image analysis (HF or Lovable vision edge function)
    path: "/functions/v1/hf-vision",
    method: "POST",
  },
  web_search: {
    // Web search tool (if implemented as its own function)
    path: "/functions/v1/web-search",
    method: "POST",
  },
  code_exec: {
    // Safe code executor (the edge function you showed earlier)
    path: "/functions/v1/code-executor",
    method: "POST",
  },
  image_gen: {
    // 🔥 Image generation tool – this is what was missing
    // Make sure your image function folder is named "generate-image"
    path: "/functions/v1/generate-image",
    method: "POST",
  },
  browser_fetch: {
    // Raw HTML / page fetcher
    path: "/functions/v1/browser-fetch",
    method: "POST",
  },
  memory_search: {
    // Semantic memory lookup
    path: "/functions/v1/memory-search",
    method: "POST",
  },
  reasoning: {
    // Optional dedicated reasoning / planning tool (if you add one)
    path: "/functions/v1/reasoning",
    method: "POST",
  },
};

/**
 * Helper to safely get a tool config by name.
 * Use this in your agent / router when dispatching tools.
 */
export function getLucyToolConfig(tool: LucyToolName): LucyToolConfig {
  return LUCY_TOOL_CONFIGS[tool];
}
