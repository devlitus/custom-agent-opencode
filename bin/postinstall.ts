import { inject } from "../src/inject.js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// INIT_CWD is set by npm/pnpm/yarn to the directory where the install was invoked.
// If it's not set we're being run directly (e.g. dev mode) — skip.
const projectRoot = process.env["INIT_CWD"];
if (!projectRoot) {
  process.exit(0);
}

// Don't inject into our own dev environment.
try {
  const targetPkg = JSON.parse(
    readFileSync(join(projectRoot, "package.json"), "utf-8"),
  ) as { name?: string };
  if (targetPkg.name === "@devlitusp/opencode-agent") {
    process.exit(0);
  }
} catch {
  // no package.json — proceed anyway
}

try {
  console.log("\n[dev-agents] Injecting OpenCode agent config...\n");
  inject({ cwd: projectRoot, verbose: true });
  console.log(
    "\n[dev-agents] Done! Set MINIMAX_API_KEY in your environment and open OpenCode.\n" +
    "[dev-agents] Use the orchestrator agent to start the full development workflow.\n"
  );
} catch (err) {
  // Non-fatal: a broken postinstall should never block npm install
  console.warn(
    "\n[dev-agents] Warning: could not inject config:",
    err instanceof Error ? err.message : err,
    "\nRun `dev-agents inject` manually to retry.\n"
  );
}
