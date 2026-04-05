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

Then set your API key:

```bash
export MINIMAX_API_KEY=your_key_here
```

Open OpenCode in your project and use the **orchestrator** agent to start.

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

opencode.json       ← MiniMax provider config + default_agent
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
```

## CLI

```bash
opencode-agent init        # full project setup
opencode-agent inject      # inject agents into opencode.json
opencode-agent inject -f   # overwrite existing agent files
opencode-agent list        # list available agents
```

## Provider

Uses [MiniMax](https://platform.minimax.io) with model `MiniMax-M2.7` via OpenAI-compatible API.

Set your API key before opening OpenCode:

```bash
export MINIMAX_API_KEY=your_key_here
```

## License

MIT
