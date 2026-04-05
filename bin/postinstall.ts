import { inject } from "../src/inject.js";

// INIT_CWD is set by npm/pnpm/yarn to the directory where the install was invoked.
// If we're not inside node_modules, we're in our own dev environment — skip.
const isInstalledAsDep = process.cwd().includes("node_modules");
const projectRoot = process.env["INIT_CWD"];

if (!isInstalledAsDep || !projectRoot) {
  process.exit(0);
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
