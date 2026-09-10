# OnlyDoc Vibe-Coding Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a non-developer clone one private repo, run one command, and land in a live browser with OnlyDoc running, then develop features inside FSD guardrails usable from both Claude Code and Cursor.

**Architecture:** Canonical rule/checklist content lives once in `docs/vibe/`; Claude skills and Cursor rules are thin adapters over it. Private `@universe-forma/*` deps are vendored as `vendor/*.tgz` (`file:` refs) so `npm install` needs no registry token. A maintainer prepare-script produces a token-free private template repo; a bootstrap script copies→installs→runs→opens it.

**Tech Stack:** Astro 5, React 19, TypeScript, Node ≥20, npm, Husky, Claude Code skills (`SKILL.md`), Cursor rules (`.mdc`).

**Spec:** `docs/superpowers/specs/2026-09-10-vibe-onboarding-design.md`

## Global Constraints

- Node floor: **≥ 20** (Astro 5). No auto-install of Node — detect and instruct only.
- Dev server: **port 4322**, `host: true` (`astro.config.ts`).
- Private deps to vendor: **`@universe-forma/global-types` (^2.4.0)**, **`@universe-forma/ui-pes` (^0.4.36)**, plus any transitive `@universe-forma/*`.
- `.npmrc` private-registry line to strip in template: `@universe-forma:registry=https://npm.pkg.github.com` + the `_authToken` line.
- `cms-schema.ts` is committed (274 KB) → dev boots offline via `astro dev` (NOT `npm start`, which triggers a CMS fetch).
- `.env` is gitignored → never commit real `.env`; bootstrap derives it from committed `.env.example`.
- `vendor/` is NOT gitignored → tarballs are committed into the template.
- Human doc language: **Ukrainian** for `README.vibe.uk.md`; all skills/rules/canonical docs in English.
- Backend ref: CMS Swagger `https://giving-crown-044b1c58a6.strapiapp.com/documentation/v1.0.0` (public). App backend `api-dev.only-doc.com` = internal, VPN-only — mark as such, never as a live link.
- New private repo: `universe-forma/only-doc-vibe`.
- Commit convention: `<type>(PDFM-0000): <subject>`, subject line only, no body, no Co-Authored-By.

---

### Task 1: Research existing vibe/plan-build workflow skills

**Files:**
- Create: `docs/vibe/.research-notes.md`

**Interfaces:**
- Produces: `docs/vibe/.research-notes.md` — bullet list of proven patterns + naming for plan-high/build-low, consumed by Task 2's `workflow.md`.

- [ ] **Step 1: Search GitHub for prior art**

Run each and skim top results:
```bash
gh search repos "claude code skill plan implement" --limit 20
gh search code "plan mode" "implement" path:.claude/skills --limit 20
gh search repos "cursor rules vibe coding workflow" --limit 20
```
Also WebSearch: "plan with strong model implement with cheap model claude code skill".

- [ ] **Step 2: Write research notes**

Capture in `docs/vibe/.research-notes.md`: 5–10 bullets of concrete patterns worth adopting (e.g. "plan-mode gate before edits", "task list as handoff artifact", "never let build model alter architecture"), each with a 1-line source. Use **generic** model wording — no hardcoded model names.

- [ ] **Step 3: Commit**

```bash
git add docs/vibe/.research-notes.md
git commit -m "docs(PDFM-0000): capture vibe-workflow prior-art research"
```

---

### Task 2: Canonical vibe docs (`docs/vibe/*.md`)

**Files:**
- Create: `docs/vibe/workflow.md`, `docs/vibe/architecture.md`, `docs/vibe/add-feature.md`, `docs/vibe/preflight.md`, `docs/vibe/backend.md`
- Read for source: `AGENTS.md`, `.cursor/rules/project-architecture.md`, `docs/vibe/.research-notes.md`

**Interfaces:**
- Produces: five canonical docs referenced by every Claude skill (Task 5) and Cursor rule (Task 6). Section anchors must be stable: `## Layer order`, `## Naming`, `## Where code goes`, `## Checklist`.

- [ ] **Step 1: Write `architecture.md`**

Distill from `AGENTS.md`: the import chain `app → pages-layer → widgets → features → entities → shared` (only import downward), `E`-prefixed enums / `I`-prefixed interfaces, `index.ts` barrels are the only import surface, data-fetching lives in `slice/api/`, content goes to `/public/locales/*` (never hardcoded), use `src/shared/ui` components (`Link`/`Image`/`Button`/`Title`) not raw tags, `margin-bottom` not `margin-top`, headless logic in `ui/lib`. End with a "❌ never do" list.

- [ ] **Step 2: Write `add-feature.md`**

Ordered steps for a non-dev: (1) decide the layer, (2) `mkdir` the slice with `ui/ model/ api/ lib/ index.ts`, (3) export only via `index.ts`, (4) put the API/CMS call in `api/`, link CMS Swagger, (5) add copy to `/public/locales/en.json` + other locales, (6) run preflight. Include one real worked example (a small feature slice).

- [ ] **Step 3: Write `preflight.md`**

Checklist with exact commands: `npm run lint:fix`, `npm run lint:types`, `npm run format`; branch name must match `^(chore|feat|fix|test|refactor|revert|ci)/.+`; confirm no upward imports; confirm no hardcoded copy.

- [ ] **Step 4: Write `backend.md`**

CMS Swagger (public) as the live API reference with the URL; note types are generated into `src/shared/api/cms/cms-schema.ts` via `npm run generate-api-schema`. Mark app backend `api-dev.only-doc.com` as **internal, VPN-only — ask the team**; never call it from a vibe machine.

- [ ] **Step 5: Write `workflow.md`**

From `.research-notes.md`: the plan-high / build-low loop. Plan with the strongest available model in plan mode → produce a design + task list, **no code**. Switch to a faster/cheaper model (`/model` in Claude Code, model picker in Cursor) → implement task-by-task. Rule: the build model executes the plan and never redesigns architecture; if it wants to, stop and re-plan with the strong model. Generic model wording only.

- [ ] **Step 6: Verify links + commit**

Run: `grep -rn "giving-crown" docs/vibe/backend.md` → expect the CMS URL present. Confirm each file is non-empty: `wc -l docs/vibe/*.md`.
```bash
git add docs/vibe/*.md
git commit -m "docs(PDFM-0000): add canonical vibe rules and checklists"
```

---

### Task 3: Vendoring scripts

**Files:**
- Create: `scripts/prepare-vibe-template.mjs`, `scripts/refresh-vendor.mjs`
- Modify: `package.json` (add `"vibe:prepare"` and `"vibe:refresh"` scripts)

**Interfaces:**
- Consumes: a working `NODE_AUTH_TOKEN` in env (maintainer only).
- Produces: `vendor/*.tgz` + rewritten `file:` deps + token-free `.npmrc`. `refresh-vendor.mjs` re-exports `vendorPrivateDeps()` used by `prepare`.

- [ ] **Step 1: Write `scripts/refresh-vendor.mjs` (the packer)**

```js
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";

const SCOPE = "@universe-forma";
const ROOT = process.cwd();

export function collectPrivateDeps() {
  const tree = JSON.parse(
    execSync("npm ls --all --json", { encoding: "utf8", maxBuffer: 1e8 }),
  );
  const found = new Map();
  const walk = (deps = {}) => {
    for (const [name, node] of Object.entries(deps)) {
      if (name.startsWith(SCOPE + "/") && node.version)
        found.set(name, node.version);
      if (node.dependencies) walk(node.dependencies);
    }
  };
  walk(tree.dependencies);
  return found; // Map<name, version>
}

export function vendorPrivateDeps() {
  const priv = collectPrivateDeps();
  if (priv.length === 0 && priv.size === 0)
    throw new Error("No @universe-forma deps found — is node_modules installed with a token?");
  mkdirSync("vendor", { recursive: true });
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  for (const [name, version] of priv) {
    execSync(`npm pack ${name}@${version} --pack-destination vendor`, { stdio: "inherit" });
    const tgz = readdirSync("vendor").find((f) =>
      f.startsWith(name.replace(SCOPE + "/", SCOPE.slice(1) + "-")) && f.endsWith(".tgz"),
    );
    if (!tgz) throw new Error(`Packed tarball not found for ${name}`);
    const rel = `file:./vendor/${tgz}`;
    if (pkg.dependencies?.[name]) pkg.dependencies[name] = rel;
    if (pkg.devDependencies?.[name]) pkg.devDependencies[name] = rel;
  }
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Vendored ${priv.size} private package(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) vendorPrivateDeps();
```

- [ ] **Step 2: Write `scripts/prepare-vibe-template.mjs` (full maintainer flow)**

```js
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
```

- [ ] **Step 3: Add npm scripts**

In `package.json` `"scripts"`, add:
```json
"vibe:prepare": "node scripts/prepare-vibe-template.mjs",
"vibe:refresh": "node scripts/refresh-vendor.mjs"
```

- [ ] **Step 4: Verify (clean-room)**

With a token in env: `npm run vibe:prepare`. Then in a temp copy with no token:
```bash
rm -rf /tmp/vibe-check && cp -R . /tmp/vibe-check && cd /tmp/vibe-check
rm -rf node_modules && NODE_AUTH_TOKEN="" npm install
```
Expected: install succeeds (resolves `@universe-forma/*` from `file:./vendor/*.tgz`, no 401).

- [ ] **Step 5: Commit** (scripts only — do NOT commit the rewritten package.json/vendor here; that happens on the template branch in Task 8)

```bash
git add scripts/prepare-vibe-template.mjs scripts/refresh-vendor.mjs package.json
git checkout -- .npmrc 2>/dev/null || true
git commit -m "feat(PDFM-0000): add private-dep vendoring scripts"
```

---

### Task 4: Bootstrap script + `vibe-up`

**Files:**
- Create: `scripts/bootstrap.mjs`, `scripts/vibe-up`
- Modify: `package.json` (add `"vibe:up"` script)

**Interfaces:**
- Consumes: a token-free repo (from Task 3 vendoring). Runs on the consumer machine.
- Produces: a running dev server on `:4322` + opened browser, in sibling `../only-doc-fe-vibe`.

- [ ] **Step 1: Write `scripts/bootstrap.mjs`**

```js
import { execSync } from "node:child_process";
import { cpSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { platform } from "node:os";

const run = (c, opts = {}) => execSync(c, { stdio: "inherit", shell: true, ...opts });
const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error(`Node ${process.versions.node} is too old. Install Node 20+ from https://nodejs.org and re-run.`);
  process.exit(1);
}

const src = process.cwd();
const dest = join(dirname(src), basename(src).replace(/-fe$/, "") + "-fe-vibe");
console.log(`Copying project → ${dest}`);
cpSync(src, dest, {
  recursive: true,
  filter: (p) => !/\/(\.git|node_modules|dist|\.astro)(\/|$)/.test(p),
});

process.chdir(dest);
if (!existsSync(".env")) {
  const seed = existsSync(".env.vibe") ? ".env.vibe" : ".env.example";
  copyFileSync(seed, ".env");
  console.log(`Created .env from ${seed}`);
}

console.log("Installing dependencies (no token needed)…");
run("npm install");

const url = "http://localhost:4322";
const opener = platform() === "darwin" ? "open" : platform() === "win32" ? "start" : "xdg-open";
setTimeout(() => { try { run(`${opener} ${url}`); } catch {} }, 4000);
console.log(`Starting dev server at ${url} …`);
run("npx astro dev"); // astro dev, NOT npm start — skips the CMS fetch, boots offline
```

- [ ] **Step 2: Write `scripts/vibe-up` (wrapper)**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
exec node scripts/bootstrap.mjs
```
Then: `chmod +x scripts/vibe-up`.

- [ ] **Step 3: Add npm script**

Add to `package.json` `"scripts"`: `"vibe:up": "node scripts/bootstrap.mjs"`.

- [ ] **Step 4: Verify (dry run)**

From the token-free clean copy: `npm run vibe:up`. Expected: creates sibling dir, installs, opens browser, serves `:4322`. Ctrl-C to stop. Confirm the sibling dir exists and has no `.git`.

- [ ] **Step 5: Commit**

```bash
git add scripts/bootstrap.mjs scripts/vibe-up package.json
git commit -m "feat(PDFM-0000): add one-command vibe bootstrap"
```

---

### Task 5: Claude skill adapters

**Files:**
- Create: `.claude/skills/vibe-workflow/SKILL.md`, `.claude/skills/add-feature/SKILL.md`, `.claude/skills/architecture-guard/SKILL.md`, `.claude/skills/preflight-check/SKILL.md`

**Interfaces:**
- Consumes: `docs/vibe/*.md` (Task 2). Each SKILL.md is a thin adapter that instructs the model to read the matching canonical doc and apply it.

- [ ] **Step 1: Write the four SKILL.md files**

Each uses YAML frontmatter (`name`, `description`) then a body that says "Read `docs/vibe/<file>.md` and follow it." Mapping:
- `vibe-workflow` → `docs/vibe/workflow.md`; description: "Plan with the strongest model, implement with a faster one. Use before starting any feature."
- `add-feature` → `docs/vibe/add-feature.md`; description: "Add a feature the FSD-correct way. Use when creating new UI/slices."
- `architecture-guard` → `docs/vibe/architecture.md`; description: "Enforce FSD import direction, naming, and clean-code rules while editing."
- `preflight-check` → `docs/vibe/preflight.md`; description: "Run before every commit: lint, types, boundary + copy checks."

Example body:
```markdown
---
name: architecture-guard
description: Enforce FSD import direction, naming, and clean-code rules while editing OnlyDoc.
---

Read `docs/vibe/architecture.md` and treat it as hard rules for any code you
write or edit in this repo. Before finishing, verify no import goes upward in
`app → pages-layer → widgets → features → entities → shared`.
```

- [ ] **Step 2: Verify + commit**

Run: `ls .claude/skills/*/SKILL.md` → expect 4. Confirm each references its `docs/vibe/*.md`.
```bash
git add .claude/skills
git commit -m "feat(PDFM-0000): add Claude vibe skills"
```

---

### Task 6: Cursor rule adapters

**Files:**
- Create: `.cursor/rules/vibe-workflow.mdc`, `.cursor/rules/add-feature.mdc`, `.cursor/rules/architecture-guard.mdc`, `.cursor/rules/preflight-check.mdc`

**Interfaces:**
- Consumes: `docs/vibe/*.md` (Task 2). Same content surface as Task 5, Cursor format.

- [ ] **Step 1: Write the four `.mdc` files**

Each with Cursor rule frontmatter and a body pointing at the canonical doc. Example:
```markdown
---
description: Enforce FSD import direction, naming, and clean-code rules while editing OnlyDoc.
globs: ["src/**/*.{ts,tsx,astro}"]
alwaysApply: false
---

Follow `docs/vibe/architecture.md` as hard rules. Never import upward in
`app → pages-layer → widgets → features → entities → shared`. Use `src/shared/ui`
components, `margin-bottom` spacing, and put copy in `/public/locales`.
```
For `vibe-workflow.mdc` set `alwaysApply: true` and `globs: []` so it always loads. `add-feature`/`preflight-check` reference their docs with `alwaysApply: false`.

- [ ] **Step 2: Verify + commit**

Run: `ls .cursor/rules/*.mdc` → expect 4.
```bash
git add .cursor/rules
git commit -m "feat(PDFM-0000): add Cursor vibe rules"
```

---

### Task 7: Ukrainian getting-started README

**Files:**
- Create: `README.vibe.uk.md`

**Interfaces:**
- Consumes: bootstrap command names from Task 4, doc paths from Task 2.

- [ ] **Step 1: Write `README.vibe.uk.md` (Ukrainian)**

Sections: (1) Що це — 1 абзац про OnlyDoc; (2) Що потрібно — Node 20+ (посилання https://nodejs.org), доступ до приватного репозиторію `universe-forma/only-doc-vibe`; (3) Один крок для запуску — `npm run vibe:up` (копіює проєкт, ставить залежності без токена, відкриває браузер на `http://localhost:4322`); (4) Як розробляти з ШІ — спочатку планувати сильнішою моделлю, потім реалізовувати швидшою (посилання на `docs/vibe/workflow.md`); список скілів Claude / правил Cursor; (5) Правила — коротко про FSD + посилання на `docs/vibe/architecture.md`, `add-feature.md`, `preflight.md`; (6) Бекенд — CMS Swagger публічний; застосунковий бекенд внутрішній.

- [ ] **Step 2: Verify + commit**

Run: `grep -c "localhost:4322" README.vibe.uk.md` → expect ≥ 1.
```bash
git add README.vibe.uk.md
git commit -m "docs(PDFM-0000): add Ukrainian vibe getting-started"
```

---

### Task 8: Produce and push the private template repo

**Files:**
- Uses: all prior tasks. Operates on a dedicated `vibe-template` branch.

**Interfaces:**
- Consumes: `npm run vibe:prepare`, a maintainer `NODE_AUTH_TOKEN`, `gh` auth.
- Produces: `universe-forma/only-doc-vibe` (private) with vendored, token-free contents.

- [ ] **Step 1: Merge the feature branch to main first**

Land `feat/vibe-onboarding` (Tasks 1–7) via PR per repo flow. The template is generated FROM the merged result.

- [ ] **Step 2: Build the template on an orphan-ish branch**

```bash
git checkout -b vibe-template
NODE_AUTH_TOKEN=<token> npm run vibe:prepare   # vendors, strips .npmrc, writes .env.vibe
git add package.json vendor .npmrc .env.vibe
git commit -m "chore(PDFM-0000): vendor private deps for token-free template"
```

- [ ] **Step 3: Clean-room verify before publishing**

```bash
rm -rf /tmp/vibe-pub && git worktree add /tmp/vibe-pub vibe-template
cd /tmp/vibe-pub && rm -rf node_modules && NODE_AUTH_TOKEN="" npm install && npx astro dev &
sleep 8 && curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:4322
```
Expected: `200`. Kill the dev server; `git worktree remove /tmp/vibe-pub`.

- [ ] **Step 4: Create the private repo and push**

```bash
gh repo create universe-forma/only-doc-vibe --private --description "OnlyDoc vibe-coding template (token-free, vendored deps)"
git push https://github.com/universe-forma/only-doc-vibe.git vibe-template:main
```

- [ ] **Step 5: Confirm**

Run: `gh repo view universe-forma/only-doc-vibe --json visibility,defaultBranchRef`. Expected: `private`, default branch `main`. Report the repo URL to the user.

---

## Self-Review

**Spec coverage:** README.vibe.uk.md → T7; bootstrap → T4; docs/vibe → T2; vendoring → T3; skills → T5; Cursor rules → T6; workflow research → T1; private repo → T8; backend-as-CMS-Swagger → T2 step 4 + Global Constraints. All spec sections mapped.

**Placeholder scan:** No TBD/TODO. Script bodies are concrete. Doc tasks specify exact sections + verify commands.

**Type consistency:** `vendorPrivateDeps()` defined in T3 step 1, imported in T3 step 2 and used in T8. npm scripts `vibe:prepare`/`vibe:refresh` (T3) and `vibe:up` (T4) consistent throughout. `.env.vibe` produced in T3 step 2 and consumed in T4 step 1. Port 4322 consistent.
