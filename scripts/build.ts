import { chmod, readFile, writeFile } from "fs/promises";
import { join } from "path";

const root = import.meta.dir ? join(import.meta.dir, "..") : process.cwd();
const outdir = join(root, "dist", "bin");

const entrypoints = [
  join(root, "bin", "dev-agents.ts"),
  join(root, "bin", "postinstall.ts"),
];

console.log("Building @devlitup/dev-agents...");

const result = await Bun.build({
  entrypoints,
  outdir,
  target: "node",
  format: "esm",
  minify: false,
  external: ["bun"],
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Bun may prepend its own shebang/header — fix each output file
for (const output of result.outputs) {
  let content = await readFile(output.path, "utf-8");
  content = content.replace(/^#!.*\n(\/\/ @bun\n)?/, "");

  const isBin = output.path.endsWith("dev-agents.js");
  content = (isBin ? "#!/usr/bin/env node\n" : "") + content;

  await writeFile(output.path, content, "utf-8");
  if (isBin) await chmod(output.path, 0o755);
  console.log(`Built: ${output.path}`);
}
