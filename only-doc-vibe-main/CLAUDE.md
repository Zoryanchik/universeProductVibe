# OnlyDoc — agent context

OnlyDoc: freemium SEO site with free document tools. Astro 5 + React 19,
Feature-Sliced Design. Students vibe-code features here (no backend access).

## Read on demand (don't inline these — open only what a task needs)

- **Locate code** → `docs/vibe/repo-map.md` (where routes/layers/api/i18n live).
- **Architecture rules** → `docs/vibe/architecture.md` (deep ref: `AGENTS.md`).
- **Add a feature** → `docs/vibe/add-feature.md`.
- **Need the backend but can't reach it** → mock it: `docs/vibe/mock-data.md`.
- **Before committing** → `docs/vibe/preflight.md`.
- **How to plan/build with AI** → `docs/vibe/workflow.md`.

## Golden rules

- FSD imports go downward only: `app → pages-layer → widgets → features → entities → shared`. Import a slice only via its `index.ts`.
- Data lives in `<slice>/api/`. Enums `E`-prefixed, interfaces `I`-prefixed.
- Copy goes in `public/locales/<lang>/translation.json` — never hardcode strings.
- Use `src/shared/ui` components (`Link`, `Image`, `Button`, `Title`), `margin-bottom` for spacing.
- Dev server: port **4322**. Start with `npm run vibe:up`.
- Don't call the internal app backend (`api-http-client`) from here — mock it (`docs/vibe/mock-data.md`).
