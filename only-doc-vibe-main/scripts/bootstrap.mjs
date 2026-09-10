import { execSync, spawn } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { platform } from "node:os";

const run = (c, opts = {}) => execSync(c, { stdio: "inherit", shell: true, ...opts });
const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error(`Node ${process.versions.node} is too old. Install Node 20+ from https://nodejs.org and re-run.`);
  process.exit(1);
}

// Always sync .env from the curated template so a stale/broken .env can't break the boot.
const seed = existsSync(".env.vibe") ? ".env.vibe" : ".env.example";
copyFileSync(seed, ".env");
console.log(`Synced .env from ${seed}`);

console.log("Installing dependencies (no token needed)…");
run("npm install");

const url = "http://localhost:4322";
const opener = platform() === "darwin" ? "open" : platform() === "win32" ? "start" : "xdg-open";
setTimeout(() => { try { run(`${opener} ${url}`); } catch {} }, 4000);
console.log(`Starting dev server at ${url} …`);
spawn("npx", ["astro", "dev"], { stdio: "inherit", shell: true }); // astro dev, NOT npm start — skips the CMS fetch, boots offline
