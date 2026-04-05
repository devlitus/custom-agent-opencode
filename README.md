# @devlitusp/opencode-agent

Multi-agent development team for [OpenCode CLI](https://opencode.ai). One command sets up a full team of AI agents in your project — orchestrator, investigator, planner, builder, QA, security, and docs writer.

## Quick start

```bash
pnpm dlx @devlitusp/opencode-agent init
```

This single command:
1. Adds `@devlitusp/opencode-agent` to your `devDependencies`
2. Configures pnpm to allow the postinstall script
3. Installs the package and runs the setup automatically

Then set your API key and open OpenCode:

```bash
export MINIMAX_API_KEY=your_key_here   # MiniMax (default)
# or
export GITHUB_TOKEN=your_token_here    # GitHub Copilot
```

## What gets created

```
.opencode/agents/
  orchestrator.md   ← primary agent, coordinates the team
  investigator.md   ← analyzes codebase and requirements
  planner.md        ← creates implementation plans
  builder.md        ← writes the code
  qa.md             ← quality assurance and tests
  security.md       ← vulnerability scanning (OWASP Top 10)
  docs-writer.md    ← JSDoc, README, documentation

opencode.json       ← provider config + default_agent
```

## Agents

| Agent | Mode | Role |
|-------|------|------|
| `orchestrator` | primary | Coordinates the full dev workflow |
| `investigator` | subagent | Analyzes codebase, researches requirements |
| `planner` | subagent | Creates detailed implementation plans |
| `builder` | subagent | Implements code following the plan |
| `qa` | subagent | Reviews quality, writes tests |
| `security` | subagent | Scans for vulnerabilities (pre and post build) |
| `docs-writer` | subagent | Writes JSDoc, README sections, examples |

## Development workflow

The orchestrator follows this sequence automatically:

```
investigate → plan → security (pre) → build → QA → security (post) → docs
```

## Providers

Two providers are supported out of the box:

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
opencode-agent init                              # full project setup
opencode-agent inject                            # inject with MiniMax (default)
opencode-agent inject --provider github-copilot # inject with GitHub Copilot
opencode-agent inject -f                         # overwrite existing agent files
opencode-agent list                              # list available agents
```

## Manual install (npm / yarn / bun)

```bash
# npm
npm install --save-dev @devlitusp/opencode-agent

# yarn
yarn add --dev @devlitusp/opencode-agent

# bun
bun add --dev @devlitusp/opencode-agent
```

Then run:

```bash
opencode-agent inject
# or with GitHub Copilot:
opencode-agent inject --provider github-copilot
```

## License

MIT
