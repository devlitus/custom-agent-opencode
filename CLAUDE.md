# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build        # Compile to dist/ via Bun bundler (scripts/build.ts)
pnpm typecheck    # tsc --noEmit (type-check only, no emit)
pnpm dev          # Run CLI directly with Bun (no build needed)
```

There are no tests. TypeScript strict mode with `noUncheckedIndexedAccess` is enforced.

## Architecture

This is a **publishable npm package** (`@devlitusp/opencode-agent`) that injects a multi-agent team into any OpenCode CLI project.

### What it produces

When `inject()` runs in a target project it:
1. Writes `.opencode/agents/*.md` — one file per agent (YAML frontmatter + system prompt)
2. Updates `opencode.json` — adds the selected AI provider and sets `default_agent: orchestrator`
3. Adds `"prepare": "opencode-agent inject"` to `package.json` so the agents re-inject on install

### Key data flow

```
src/agents/*.ts          Agent definitions (name, frontmatter, prompt)
       ↓
src/agents/index.ts      ALL_AGENTS array
       ↓
src/inject.ts            toMarkdown() serializes frontmatter → YAML + prompt
                         inject() writes files and patches opencode.json
       ↓
.opencode/agents/*.md    Consumed by OpenCode at runtime
```

### Agent frontmatter → OpenCode config mapping

Each `AgentDefinition.frontmatter` field maps 1:1 to the YAML frontmatter in the generated `.md` file. The `tools` field (`Partial<Record<ToolName, boolean>>`) uses OpenCode's actual permission names: `bash`, `computer`, `edit`, `glob`, `grep`, `list`, `read`, `task`, `webfetch`, `websearch`, `write`.

### Provider system

`PROVIDERS` in `inject.ts` maps each `ProviderName` (`"minimax" | "github-copilot"`) to its key, `OpenCodeProvider` config, default model string, and required env var. When a provider is selected, `toMarkdown(agent, providerConfig.defaultModel)` overrides the model in the generated frontmatter. Model strings follow the format `{provider-key}/{model-name}` (e.g. `github-copilot/gpt-4o`).

### Build

`scripts/build.ts` uses `Bun.build()` to bundle `bin/dev-agents.ts` and `bin/postinstall.ts` into `dist/bin/`. It strips Bun's shebang and injects `#!/usr/bin/env node` so the output runs in plain Node.

### CLI entry points

- `bin/dev-agents.ts` — user-facing CLI (`inject`, `list`, `init` commands + `--provider`, `--force`, `--verbose` flags)
- `bin/postinstall.ts` — runs automatically on `npm install` when the package is a dep; calls `inject()` with `INIT_CWD` as target
- `src/init.ts` — `pnpm dlx` flow: patches `pnpm.onlyBuiltDependencies`, detects the package manager, then installs the package (which triggers postinstall)
