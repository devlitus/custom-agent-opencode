import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ALL_AGENTS } from "./agents/index.js";
import type { AgentDefinition, AgentFrontmatter, InjectOptions, OpenCodeConfig, OpenCodeProvider, ProviderName } from "./types.js";

// ── Provider definitions ─────────────────────────────────────────────────────

const MINIMAX_PROVIDER_KEY = "minimax";
const MINIMAX_PROVIDER: OpenCodeProvider = {
  npm: "@ai-sdk/openai-compatible",
  name: "MiniMax",
  options: {
    baseURL: "https://api.minimax.chat/v1",
    apiKey: "{env:MINIMAX_API_KEY}",
  },
  models: {
    "MiniMax-M2.7": { name: "MiniMax-M2.7" },
  },
};

const GITHUB_COPILOT_PROVIDER_KEY = "github-copilot";
const GITHUB_COPILOT_PROVIDER: OpenCodeProvider = {
  npm: "@ai-sdk/openai-compatible",
  name: "GitHub Copilot",
  options: {
    baseURL: "https://api.githubcopilot.com",
    apiKey: "{env:GITHUB_TOKEN}",
  },
  models: {
    "gpt-4o": { name: "gpt-4o" },
    "gpt-4o-mini": { name: "gpt-4o-mini" },
    "o3-mini": { name: "o3-mini" },
    "claude-sonnet-4-5": { name: "claude-sonnet-4-5" },
    "claude-3-5-haiku": { name: "claude-3-5-haiku" },
  },
};

interface ProviderConfig {
  key: string;
  provider: OpenCodeProvider;
  defaultModel: string;
  envVar: string;
}

const PROVIDERS: Record<ProviderName, ProviderConfig> = {
  minimax: {
    key: MINIMAX_PROVIDER_KEY,
    provider: MINIMAX_PROVIDER,
    defaultModel: `${MINIMAX_PROVIDER_KEY}/MiniMax-M2.7`,
    envVar: "MINIMAX_API_KEY",
  },
  "github-copilot": {
    key: GITHUB_COPILOT_PROVIDER_KEY,
    provider: GITHUB_COPILOT_PROVIDER,
    defaultModel: `${GITHUB_COPILOT_PROVIDER_KEY}/gpt-4o`,
    envVar: "GITHUB_TOKEN",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toMarkdown(agent: AgentDefinition, modelOverride?: string): string {
  const base = agent.frontmatter as AgentFrontmatter & Record<string, unknown>;
  const fm: AgentFrontmatter & Record<string, unknown> = modelOverride
    ? { ...base, model: modelOverride }
    : base;
  const lines: string[] = ["---"];

  for (const [key, value] of Object.entries(fm)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else if (typeof value === "object") {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        lines.push(`  ${k}: ${v}`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---", "", agent.prompt);
  return lines.join("\n");
}

function readOpenCodeConfig(configPath: string): OpenCodeConfig {
  if (!existsSync(configPath)) return {};
  const raw = readFileSync(configPath, "utf-8");
  // First try plain JSON, then try stripping JSONC comments (only outside strings)
  try {
    return JSON.parse(raw) as OpenCodeConfig;
  } catch {
    // Strip JSONC single-line comments that are NOT inside quoted strings
    const stripped = raw.replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*/g, (_, str) => str ?? "");
    try {
      return JSON.parse(stripped) as OpenCodeConfig;
    } catch {
      throw new Error(`Failed to parse ${configPath} — check for JSON syntax errors`);
    }
  }
}

function writeOpenCodeConfig(configPath: string, config: OpenCodeConfig): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

// ── Public API ───────────────────────────────────────────────────────────────

export function inject(options: InjectOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const force = options.force ?? false;
  const verbose = options.verbose ?? false;
  const providerConfig = PROVIDERS[options.provider ?? "minimax"];

  const log = (msg: string) => verbose && console.log(`  ${msg}`);

  // ── 1. Write .opencode/agents/*.md ──────────────────────────────────────
  const agentsDir = join(cwd, ".opencode", "agents");
  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
    log(`Created ${agentsDir}`);
  }

  for (const agent of ALL_AGENTS) {
    const agentPath = join(agentsDir, `${agent.name}.md`);
    if (existsSync(agentPath) && !force) {
      log(`Skipped ${agent.name}.md (already exists — use --force to overwrite)`);
      continue;
    }
    writeFileSync(agentPath, toMarkdown(agent, providerConfig.defaultModel), "utf-8");
    log(`Wrote ${agent.name}.md`);
  }

  // ── 2. Update opencode.json ──────────────────────────────────────────────
  const configPath = join(cwd, "opencode.json");
  const config = readOpenCodeConfig(configPath);
  let changed = false;

  // Schema
  if (!config.$schema) {
    config.$schema = "https://opencode.ai/config.json";
    changed = true;
  }

  // Default agent
  if (!config.default_agent || force) {
    config.default_agent = "orchestrator";
    changed = true;
    log(`Set default_agent = orchestrator`);
  }

  // Provider
  if (!config.provider) config.provider = {};
  if (!config.provider[providerConfig.key] || force) {
    config.provider[providerConfig.key] = providerConfig.provider;
    changed = true;
    log(`Added ${providerConfig.key} provider`);
  }

  if (changed) {
    writeOpenCodeConfig(configPath, config);
    log(`Updated ${configPath}`);
  }

  // ── 3. Add prepare script to package.json ───────────────────────────────
  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    const raw = readFileSync(pkgPath, "utf-8");
    let pkg: Record<string, unknown>;
    try {
      pkg = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      log(`Skipped package.json — could not parse`);
      return;
    }

    const scripts = (pkg["scripts"] ?? {}) as Record<string, string>;
    if (!scripts["prepare"] || force) {
      scripts["prepare"] = "dev-agents inject";
      pkg["scripts"] = scripts;
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
      log(`Added "prepare": "dev-agents inject" to package.json`);
    } else {
      log(`Skipped package.json prepare script (already exists)`);
    }
  }
}

export function list(): void {
  console.log("\nAvailable agents:\n");
  for (const agent of ALL_AGENTS) {
    const mode = agent.frontmatter.mode === "primary" ? "primary  " : "subagent ";
    console.log(`  ${mode}  ${agent.name.padEnd(15)} — ${agent.frontmatter.description}`);
  }
  console.log();
}
