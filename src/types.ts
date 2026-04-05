export type ToolName =
  | "bash"
  | "computer"
  | "edit"
  | "glob"
  | "grep"
  | "list"
  | "read"
  | "task"
  | "webfetch"
  | "websearch"
  | "write";

export interface AgentFrontmatter {
  model: string;
  description: string;
  mode: "primary" | "subagent" | "all";
  temperature?: number;
  steps?: number;
  tools?: Partial<Record<ToolName, boolean>>;
}

export interface AgentDefinition {
  name: string;
  frontmatter: AgentFrontmatter;
  prompt: string;
}

export interface ProviderApiOptions {
  baseURL: string;
  apiKey: string;
}

export interface OpenCodeProvider {
  npm: string;
  name: string;
  options: ProviderApiOptions;
  models: Record<string, { name: string }>;
}

export type ProviderName = "minimax" | "github-copilot";

export interface OpenCodeConfig {
  $schema?: string;
  default_agent?: string;
  provider?: Record<string, OpenCodeProvider>;
  agent?: Record<string, {
    model?: string;
    description?: string;
    mode?: string;
    temperature?: number;
    steps?: number;
    prompt?: string;
    tools?: Partial<Record<ToolName, boolean>>;
  }>;
  [key: string]: unknown;
}

export interface InjectOptions {
  cwd?: string;
  force?: boolean;
  verbose?: boolean;
  provider?: ProviderName;
}
