import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PACKAGE_NAME = "@devlitusp/opencode-agent";

export function init(cwd: string = process.cwd()): void {
  const pkgPath = join(cwd, "package.json");

  // ── 1. Read or create package.json ────────────────────────────────────────
  let pkg: Record<string, unknown> = {};
  if (existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
    } catch {
      console.error("Error: could not parse package.json");
      process.exit(1);
    }
  }

  // ── 2. Add onlyBuiltDependencies ──────────────────────────────────────────
  const pnpmConfig = (pkg["pnpm"] ?? {}) as Record<string, unknown>;
  const allowed = (pnpmConfig["onlyBuiltDependencies"] ?? []) as string[];

  if (!allowed.includes(PACKAGE_NAME)) {
    pnpmConfig["onlyBuiltDependencies"] = [...allowed, PACKAGE_NAME];
    pkg["pnpm"] = pnpmConfig;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
    console.log(`  Added ${PACKAGE_NAME} to pnpm.onlyBuiltDependencies`);
  }

  // ── 3. Detect package manager ──────────────────────────────────────────────
  const pm = detectPackageManager(cwd);
  console.log(`  Detected package manager: ${pm}`);

  // ── 4. Install the package (triggers postinstall automatically) ────────────
  const version = getOwnVersion();
  const installCmd = buildInstallCommand(pm, version, cwd);

  console.log(`  Running: ${installCmd}\n`);
  try {
    execSync(installCmd, { cwd, stdio: "inherit" });
  } catch {
    console.error(`\nInstall failed. Try running manually:\n  ${installCmd}`);
    process.exit(1);
  }
}

function detectPackageManager(cwd: string): string {
  // npm_config_user_agent is set by the package manager that invoked the script
  // e.g. "pnpm/10.33.0 npm/? node/..." or "yarn/1.22.0 ..."
  const agent = process.env["npm_config_user_agent"] ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("bun")) return "bun";

  // Fallback: check for lock files
  if (existsSync(join(cwd, "pnpm-lock.yaml")) || existsSync(join(cwd, "pnpm-workspace.yaml"))) {
    return "pnpm";
  }
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) return "bun";
  return "npm";
}

function getOwnVersion(): string {
  try {
    // When running via dlx, __dirname is the temp package location
    const selfPkg = join(import.meta.dirname ?? ".", "..", "package.json");
    if (existsSync(selfPkg)) {
      const p = JSON.parse(readFileSync(selfPkg, "utf-8")) as { version: string };
      return p.version;
    }
  } catch { /* fallback */ }
  return "latest";
}

function buildInstallCommand(pm: string, version: string, _cwd: string): string {
  const pkg = `${PACKAGE_NAME}@${version}`;
  switch (pm) {
    case "pnpm": return `pnpm add --save-dev ${pkg}`;
    case "yarn": return `yarn add --dev ${pkg}`;
    case "bun":  return `bun add --dev ${pkg}`;
    default:     return `npm install --save-dev ${pkg}`;
  }
}
