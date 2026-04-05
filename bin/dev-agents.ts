import { inject, list } from "../src/inject.js";
import { init } from "../src/init.js";
import type { ProviderName } from "../src/types.js";

const args = process.argv.slice(2);
const command = args[0];

const providerIdx = Math.max(args.indexOf("--provider"), args.indexOf("-p"));
const rawProvider = providerIdx !== -1 ? args[providerIdx + 1] : undefined;
const VALID_PROVIDERS: ProviderName[] = ["minimax", "github-copilot"];
const provider: ProviderName | undefined =
  rawProvider && (VALID_PROVIDERS as string[]).includes(rawProvider)
    ? (rawProvider as ProviderName)
    : undefined;

const flags = {
  force: args.includes("--force") || args.includes("-f"),
  verbose: args.includes("--verbose") || args.includes("-v"),
  help: args.includes("--help") || args.includes("-h"),
};

function printHelp(): void {
  console.log(`
@devlitusp/opencode-agent — multi-agent dev team for OpenCode CLI

Usage:
  pnpm dlx @devlitusp/opencode-agent init          Setup project (recommended)
  opencode-agent inject [options]                  Inject agents into current project
  opencode-agent list                              List all available agents

Options:
  -p, --provider <name>    AI provider to use: minimax (default) | github-copilot
  -f, --force              Overwrite existing agent files and config entries
  -v, --verbose            Show detailed output
  -h, --help               Show this help message

Examples:
  opencode-agent inject
  opencode-agent inject --provider github-copilot
  opencode-agent inject --provider minimax --force

Environment variables:
  MINIMAX_API_KEY     Required when using the minimax provider
  GITHUB_TOKEN        Required when using the github-copilot provider
`);
}

if (flags.help || !command) {
  printHelp();
  process.exit(0);
}

if (rawProvider && !provider) {
  console.error(`\nUnknown provider: "${rawProvider}". Valid options: ${VALID_PROVIDERS.join(", ")}\n`);
  process.exit(1);
}

switch (command) {
  case "init": {
    console.log("\nSetting up @devlitusp/opencode-agent...\n");
    init();
    break;
  }

  case "inject": {
    const selectedProvider = provider ?? "minimax";
    const envVarHint = selectedProvider === "github-copilot"
      ? "Set GITHUB_TOKEN in your environment and open OpenCode."
      : "Set MINIMAX_API_KEY in your environment and open OpenCode.";

    console.log(`Injecting agents into OpenCode project config (provider: ${selectedProvider})...\n`);
    try {
      inject({ force: flags.force, verbose: true, provider: selectedProvider });
      console.log(
        `\nDone! ${envVarHint}\n` +
        "Use the orchestrator agent to start the full development workflow.\n"
      );
    } catch (err) {
      console.error("\nError:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
    break;
  }

  case "list": {
    list();
    break;
  }

  default: {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}
