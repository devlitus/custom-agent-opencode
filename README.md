# @devlitusp/opencode-agent

Multi-agent development team for [OpenCode CLI](https://opencode.ai). Sets up a full team of AI agents in your project — orchestrator, investigator, planner, builder, QA, security, docs, debugger, performance, devops, and refactorer.

## Installation

### npm

```bash
npm install --save-dev @devlitusp/opencode-agent
```

npm runs postinstall scripts automatically. Agents are injected immediately — no extra steps needed.

---

### yarn

```bash
yarn add --dev @devlitusp/opencode-agent
```

yarn runs postinstall scripts automatically. Agents are injected immediately — no extra steps needed.

---

### bun

```bash
bun add --dev @devlitusp/opencode-agent
```

bun runs postinstall scripts automatically. Agents are injected immediately — no extra steps needed.

---

### pnpm

pnpm v10+ **blocks all postinstall scripts by default** for security. You must explicitly allow this package to run its script before installing.

**Option A — use `init` (recommended, handles everything automatically):**

```bash
pnpm dlx @devlitusp/opencode-agent init
```

This adds the package to the allowlist, installs it, and injects the agents in one step.

**Option B — `pnpm-workspace.yaml` (pnpm v10.26.0+):**

Add to your `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  - "@devlitusp/opencode-agent"
```

Then install:

```bash
pnpm add --save-dev @devlitusp/opencode-agent
```

**Option C — `package.json`:**

Add to your `package.json`:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["@devlitusp/opencode-agent"]
  }
}
```

Then install:

```bash
pnpm add --save-dev @devlitusp/opencode-agent
```

**Option D — allow all builds (not recommended):**

```bash
pnpm config set dangerouslyAllowAllBuilds true --global
pnpm add --save-dev @devlitusp/opencode-agent
```

> If you skip the allowlist and install directly with `pnpm add`, the package is added to `devDependencies` but the postinstall is silently skipped — no agents are created. Run `opencode-agent inject` manually afterwards to fix this.

---

After installation, set your API key and open OpenCode:

```bash
export MINIMAX_API_KEY=your_key_here   # MiniMax (default)
# or
export GITHUB_TOKEN=your_token_here    # GitHub Copilot
```

## What gets created

```
.opencode/agents/
  orchestrator.md   ← primary agent, coordinates the team
  investigator.md   ← researches libraries and external APIs
  planner.md        ← creates implementation plans
  builder.md        ← writes the code
  qa.md             ← quality assurance and tests
  security.md       ← vulnerability scanning (OWASP Top 10)
  docs-writer.md    ← JSDoc, README, documentation
  debugger.md       ← diagnoses errors and stack traces
  performance.md    ← profiles bottlenecks and optimizations
  devops.md         ← CI/CD, Docker, infrastructure-as-code
  refactorer.md     ← improves code structure without changing behavior

opencode.json       ← provider config + default_agent
```

## Agents

| Agent | Mode | Role |
|-------|------|------|
| `orchestrator` | primary | Coordinates the full dev workflow |
| `investigator` | subagent | Researches libraries, frameworks, and external APIs |
| `planner` | subagent | Creates detailed implementation plans |
| `builder` | subagent | Implements code following the plan |
| `qa` | subagent | Reviews quality, writes tests |
| `security` | subagent | Scans for vulnerabilities (pre and post build) |
| `docs-writer` | subagent | Writes JSDoc, README sections, examples |
| `debugger` | subagent | Diagnoses errors, analyzes stack traces |
| `performance` | subagent | Profiles bottlenecks, recommends optimizations |
| `devops` | subagent | Handles CI/CD, Docker, deployment configs |
| `refactorer` | subagent | Improves code structure without changing behavior |

## Development workflows

The orchestrator selects the right workflow based on the task:

```
# Standard feature
investigate → plan → security (pre) → build → QA → security (post) → docs

# Bug report
debugger (diagnose) → builder (fix) → qa (verify)

# Performance issue
performance (profile) → builder (optimize) → qa (benchmark)

# Cleanup / refactor
refactorer (plan) → builder (apply) → qa (verify)

# Deployment task
devops (design) → security (review) → builder (implement)
```

## Providers

| Provider | Flag | Model | Env var |
|----------|------|-------|---------|
| [MiniMax](https://platform.minimax.io) | `minimax` *(default)* | `MiniMax-M2.7` | `MINIMAX_API_KEY` |
| [GitHub Copilot](https://github.com/features/copilot) | `github-copilot` | `gpt-4o` | `GITHUB_TOKEN` |

Pass `--provider` to choose:

```bash
opencode-agent inject --provider github-copilot
opencode-agent inject --provider minimax
```

GitHub Copilot also exposes `gpt-4o-mini`, `o3-mini`, `claude-sonnet-4-5`, and `claude-3-5-haiku` in `opencode.json` for manual selection.

## CLI

```bash
opencode-agent init                              # full project setup (pnpm-safe)
opencode-agent inject                            # inject with MiniMax (default)
opencode-agent inject --provider github-copilot # inject with GitHub Copilot
opencode-agent inject -f                         # overwrite existing agent files
opencode-agent list                              # list available agents
```

## License

MIT
