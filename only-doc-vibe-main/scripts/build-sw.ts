import fs from "node:fs";
import path from "node:path";

import { build, context, type BuildOptions, type SameShape } from "esbuild";
import "dotenv/config";

import { defaultLocale } from "../src/shared/config/locale";

const root = path.resolve(process.cwd());
const outdir = path.join(root, "public");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

const isWatch = process.argv.includes("--watch");

const common: SameShape<BuildOptions, BuildOptions> = {
  platform: "browser",
  target: ["es2020"],
  bundle: false,
  sourcemap: false,
  legalComments: "none",
  resolveExtensions: [".ts", ".js"],
  define: {
    "process.env.MAIN_APP_BASE": JSON.stringify(process.env.MAIN_APP_BASE),
    "process.env.PROJECT_BASE": JSON.stringify(process.env.PROJECT_BASE),
    "process.env.SW_BASE": JSON.stringify(process.env.SW_BASE || ""),
    "process.env.DEFAULT_LOCALE": JSON.stringify(defaultLocale || ""),
  },
  entryPoints: {
    sw: path.join(root, "src/app/initers/serviceWorkerIniter/sw.ts"),
    "sw-config": path.join(
      root,
      "src/app/initers/serviceWorkerIniter/sw-config.ts"
    ),
  },
  outdir,
  entryNames: "[name]",
};

async function run() {
  if (isWatch) {
    const ctx = await context(common);
    await ctx.watch();
    console.log("[sw] watch started → public/sw.js, public/sw-config.js");
  } else {
    await build(common);
    console.log("[sw] built → public/sw.js, public/sw-config.js");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
