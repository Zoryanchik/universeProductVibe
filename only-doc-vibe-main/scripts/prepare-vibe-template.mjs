import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { vendorPrivateDeps } from "./refresh-vendor.mjs";

const run = (c, opts = {}) => execSync(c, { stdio: "inherit", ...opts });

if (!process.env.NODE_AUTH_TOKEN)
  throw new Error("NODE_AUTH_TOKEN required to prepare the template (maintainer step).");

run("npm install");
vendorPrivateDeps();

// Strip the private registry from .npmrc so consumers need no token.
if (existsSync(".npmrc")) {
  const clean = readFileSync(".npmrc", "utf8")
    .split("\n")
    .filter((l) => !l.includes("npm.pkg.github.com"))
    .join("\n");
  writeFileSync(".npmrc", clean);
}

// Seed a safe env template consumers copy to .env.
if (existsSync(".env.example")) writeFileSync(".env.vibe", readFileSync(".env.example"));

console.log("Template prepared. Next: verify clean-room install, then push.");
