# Repo map — where things live

Read this to locate code without searching. Paths are from the repo root.

## Layers (Feature-Sliced Design)

| Layer | Path | What's there |
|-------|------|--------------|
| app | `src/app/` | layouts (`layout/seoLayout`), third-party scripts, service worker, global types |
| pages-layer | `src/pages-layer/` | page compositions: `seoService` (home + service pages), `blog`, `dashboard`, `editor`, `templatesEditor`, `pdfTemplates`, `aiSummarizer`, `aboutUs`, `contactUs`, `legal`, `login`, `signUp`, `resetPassword`, `base`, `404` |
| widgets | `src/widgets/` | composite blocks: `navbar`, `footer`, `heroUploadSection`, `blog`, `dashboard`, editor* rails/bars, `modalsController`, `analyticsIniter`, `userIniter` |
| features | `src/features/` | interactions: `auth-*` (login/signup/logout/reveal/reset-password), file tools (`compress`, `convert`, `ocr`, `unlock-pdf`, `remove-watermark`, `enhance-image`, `translate-pdf`), `aiSummarizer`, `editor*`, `dashboard-*`, `contact-us`, `funnelUpload` |
| entities | `src/entities/` | `user`, `documents` |
| shared | `src/shared/` | `api`, `config`, `constants`, `lib`, `types`, `ui` |

Import direction only downward: `app → pages-layer → widgets → features → entities → shared`.

## Routing (Astro file-based)

`pages/*.astro` = routes; each composes a `pages-layer` slice. Localized twins live under `pages/[...lang]/`.

| Route | Page-layer slice |
|-------|------------------|
| `pages/index.astro`, `[service].astro` | `seoService` |
| `pages/blog/**` | `blog` |
| `pages/dashboard*`, `dashboard/account` | `dashboard` |
| `pages/editor.astro` | `editor` / `templatesEditor` |
| `pages/pdf-templates/**` | `pdfTemplates` |
| `pages/pdf-summarizer/chat` | `aiSummarizer` |
| `pages/{login,sign-up,reset-password,about-us,contact-us}` | matching slice |
| `pages/sitemap.xml.ts`, `robots.txt.ts` | generated endpoints |

## Data / API

| Need | Where |
|------|-------|
| CMS (Strapi) client | `src/shared/api/cms/cms-http-client.ts` (+ generated types `cms/cms-schema.ts`) |
| App backend client (internal) | `src/shared/api/api-http-client.ts`, routes in `api-routes.ts` |
| CMS fetchers | `src/shared/api/fetchers/` (navbar, footer, locales, templates…) |
| Per-slice data | `features|entities/<slice>/api/services.ts` + `api/api-hooks.ts` |
| Mock data (hypotheses) | toggle `src/shared/config/mocks.ts`; guide `docs/vibe/mock-data.md` |

## i18n

- Strings: `public/locales/<lang>/translation.json` — langs: `ar de en es fr id pl pt`.
- Server: `src/shared/lib/translations/server-t.ts`; client: `…/useTranslation.ts`.
- Never hardcode copy — add keys to every locale.

## Config & commands

| File | Purpose |
|------|---------|
| `astro.config.ts` | env schema (required vars), dev port **4322** |
| `.env.vibe` → `.env` | local env (synced by `vibe:up`) |
| `eslint.config.ts`, `tsconfig.json`, `.prettierrc` | lint/types/format |

| Command | Does |
|---------|------|
| `npm run vibe:up` | sync env + install + run + open browser |
| `npm start` | dev server (4322) |
| `npm run build` | production build |
| `npm run lint:fix` / `lint:types` | fix lint / typecheck |
| `npm run generate-api-schema` | regenerate CMS types |

## Deeper docs

`AGENTS.md` — full architecture rules. `docs/vibe/` — vibe guardrails (`architecture`, `add-feature`, `preflight`, `workflow`, `backend`, `mock-data`).
