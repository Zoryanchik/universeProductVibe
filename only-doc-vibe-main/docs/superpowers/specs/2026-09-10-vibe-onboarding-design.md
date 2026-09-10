# OnlyDoc Vibe-Coding Onboarding — Design

**Date:** 2026-09-10
**Status:** Approved for planning
**Author:** vibe-onboarding workstream

## Goal

Make `only-doc-fe` runnable and safely extendable by someone with **no
frontend-development background**. They should get a private repo, run **one
command**, and land in a browser with the app live — then develop features
inside guardrails that keep the Feature-Sliced Design (FSD) architecture intact.
The work must be usable from **both Claude Code and Cursor**.

## Non-goals

- No access to the internal app backend, its repo, or Doppler.
- No automated import-boundary ESLint plugin (rules are documented, not
  mechanically enforced) — explicitly chosen to keep it light.
- No auto-install of system software (Node) — we detect and instruct.

## Constraints discovered in the repo

- **Private deps gate `npm install`:** `@universe-forma/global-types` and
  `@universe-forma/ui-pes` resolve from GitHub Packages via `.npmrc`
  (`@universe-forma:registry=https://npm.pkg.github.com`, needs
  `NODE_AUTH_TOKEN` with `read:packages`). This is the #1 stranger blocker and
  must be removed by vendoring.
- **Dev port:** 4322 (`astro.config.ts` → `server.port`).
- **Node:** Astro 5 → require Node ≥ 20. No `.nvmrc` today.
- **`npm start` runs `generate-api-schema` first** — fetches the Strapi CMS
  OpenAPI (`https://giving-crown-044b1c58a6.strapiapp.com/documentation/v1.0.0`,
  **public, returns 200**) then `astro dev`. The generated file
  `src/shared/api/cms/cms-schema.ts` is committed, so dev can boot offline by
  calling `astro dev` directly.
- **App backend (`api-dev.only-doc.com`) is NOT public** — DNS does not resolve
  off-VPN. Guardrails reference the **public CMS Swagger** as the live API doc
  and mark the app backend as internal ("ask the team / needs VPN").
- Husky `prepare` runs on install; `pre-commit` validates branch name + runs
  `npm run precommit` (lint:fix, lint:types, format).

## Architecture — single source of truth, dual adapters

Canonical rule/checklist content lives once in `docs/vibe/`. Claude and Cursor
each get a **thin adapter** that points at the canonical file — no content
duplication, no drift.

```
docs/vibe/*.md            ← canonical content (rules, checklists, workflow)
.claude/skills/<name>/    ← Claude adapter (SKILL.md referencing docs/vibe/*)
.cursor/rules/*.mdc       ← Cursor adapter (rule frontmatter referencing docs/vibe/*)
```

## Deliverables

### 1. `README.vibe.uk.md` (repo root) — Ukrainian
Human entry point. Plain-language "як почати вайбкодити":
- What OnlyDoc is (1 paragraph).
- Prerequisites: Node 20+ (with install link), the private repo access, Doppler
  optional.
- **The one command** to bootstrap.
- How to drive Claude Code / Cursor (which skills exist, when they fire).
- The plan-high / build-low workflow in two sentences + link to the workflow
  skill.

### 2. Bootstrap (Phase B — the vibe-coder, no access)
`scripts/bootstrap.mjs` + `scripts/vibe-up` (thin shell wrapper). Steps:
1. Check Node ≥ 20 → if missing, print https://nodejs.org link and exit.
2. **Copy** repo to sibling `../only-doc-fe-vibe/` (exclude `.git`,
   `node_modules`, `dist`, `.astro`).
3. Ensure `.env`: copy `.env.example` → `.env` if absent. If `doppler` CLI is
   present and authed, offer `doppler run` instead; otherwise proceed with the
   committed safe defaults.
4. `npm install` — succeeds with **no token** because private deps are vendored
   tarballs (see Deliverable 4).
5. Start `astro dev` (skips the schema-gen network fetch → boots offline) and
   open `http://localhost:4322`.
6. Every failure prints a plain-language "what to do" message.

### 3. `docs/vibe/` — canonical rules + checklists
- `workflow.md` — plan-high / build-low discipline (see Deliverable 5a).
- `architecture.md` — FSD boundaries distilled from `AGENTS.md`: import
  direction `app → pages-layer → widgets → features → entities → shared`, `E`/`I`
  naming, `index.ts` barrels only, data lives in `slice/api/`, clean-code rules.
- `add-feature.md` — step-by-step: pick the layer, scaffold the slice, wire the
  public API, where the backend/CMS call goes (+ CMS Swagger link).
- `preflight.md` — pre-commit checklist (lint, types, boundary sanity, branch
  name pattern).
- `backend.md` — the API reference: CMS Swagger (public) + app backend marked
  internal.

### 4. Vendoring private deps (Phase A — maintainer, has access)
`scripts/prepare-vibe-template.mjs`:
1. `npm install` with a valid `NODE_AUTH_TOKEN`.
2. Detect **all** `@universe-forma/*` in the resolved tree (direct + transitive).
3. `npm pack` each into `vendor/*.tgz`.
4. Rewrite those `package.json` deps to `file:./vendor/<name>-<version>.tgz`.
5. Strip the private-registry line from `.npmrc` (keep it token-free).
6. Seed a safe `.env` (public/dummy values; no secrets).
7. Commit and push to the new private repo.

`scripts/refresh-vendor.mjs` re-runs steps 1–4 when ui-pes/global-types bump.

**Risk:** a vendored private dep may itself pull another private dep at install
time. The detection walks the full resolved tree and packs transitively; the
prepare script verifies a clean-room `npm install` (empty `NODE_AUTH_TOKEN`)
succeeds before it pushes.

### 5. Skills / rules (dual: Claude + Cursor)
Each is a thin adapter over the matching `docs/vibe/*.md`.

- **5a. `vibe-workflow`** — plan-high / build-low. First implementation step is
  to **research GitHub** for existing plan-then-implement / vibecoding workflow
  skills, adopt proven patterns and naming, and write ours with **generic**
  high/low wording ("strongest available model to plan, faster model to build")
  so it survives model releases. Covers: plan in plan-mode with the strong
  model → produce design + task list, no code; switch model (`/model`) → build;
  never let the cheap model redesign architecture.
- **5b. `add-feature`** — drives the `docs/vibe/add-feature.md` flow.
- **5c. `architecture-guard`** — enforces `docs/vibe/architecture.md` while
  generating/editing code.
- **5d. `preflight-check`** — runs the `docs/vibe/preflight.md` checklist before
  commit.

### 6. New private repo
`universe-forma/only-doc-vibe` (private), created + pushed via `gh` at
implementation time, containing the vendored, token-free template.

## Data / control flow

```
Maintainer machine (access)                 Vibe-coder machine (no access)
────────────────────────────                ──────────────────────────────
prepare-vibe-template.mjs                    git clone only-doc-vibe (private)
  ├ npm install (token)                        │
  ├ pack @universe-forma/* → vendor/           ▼
  ├ rewrite deps → file:./vendor/*.tgz       scripts/vibe-up
  ├ strip .npmrc registry line                 ├ check Node ≥ 20
  ├ seed safe .env                             ├ copy → ../only-doc-fe-vibe
  └ gh repo create + push ──────────────────►  ├ .env from .env.example
                                                ├ npm install (NO token)
                                                └ astro dev + open :4322
```

## Testing / verification

- **Clean-room install:** in a fresh dir with `NODE_AUTH_TOKEN=""`,
  `npm install` on the vendored template must succeed and `astro dev` must serve
  `:4322`.
- **Bootstrap dry-run:** `vibe-up` on a machine without the private token
  reaches a live browser.
- **Skill/rule parity:** the same guidance is reachable from both a Claude skill
  and a Cursor rule (adapters resolve to the same `docs/vibe/*.md`).
- **Offline boot:** `astro dev` serves with no network (committed `cms-schema.ts`).

## Open decisions (resolved)

- Vendoring = **tarballs** (`npm pack` → `file:`). ✔
- Repo creation = **I create + push** `universe-forma/only-doc-vibe`. ✔
- Enforcement = documented only, no ESLint boundary plugin. ✔
- Backend = CMS Swagger (public) as live ref; app backend internal. ✔
- Human doc language = **Ukrainian** (`README.vibe.uk.md`); skills/rules English.
