# Architecture

This project follows Feature-Sliced Design (FSD). The rules below are not style
preferences — the lint and type-check steps in `preflight.md` will fail if you
break them. Read this before writing any code.

## Layer order

Code is organized into layers. Each layer may only import from the layers
**below** it in this list — never from a layer above:

```
app → pages-layer → widgets → features → entities → shared
```

| Layer           | Path               | Purpose                                          |
| --------------- | ------------------ | ------------------------------------------------- |
| **app**         | `src/app/`         | Global setup: layouts, styles, providers          |
| **pages-layer** | `src/pages-layer/` | Page compositions (Astro handles routing itself) |
| **widgets**     | `src/widgets/`     | Composite UI blocks (Navbar, Footer, Sidebar)     |
| **features**    | `src/features/`    | User interactions (forms, actions, toggles)       |
| **entities**    | `src/entities/`    | Business entities (User, Document)                |
| **shared**      | `src/shared/`      | Reusable utilities, UI, API clients, types        |

```typescript
// Correct: a widget importing from shared (below it)
import { Button } from "@/shared/ui";

// Forbidden: shared importing from a widget (above it)
import { Navbar } from "@/widgets/navbar";
```

If a change requires importing "upward," that's a signal the code belongs in a
different layer — move it down, don't add the import.

## Naming

- **Enums** are prefixed `E`: `ELanguages`, `EFileType`, `EFunnels`.
- **Interfaces** are prefixed `I`: `IUserProps`, `IContactUsFormContent`.
- **Types** get a plain descriptive name (no prefix): `PageParams`, `LocaleCode`.
- **Component files** are PascalCase: `UserCard.tsx`, `ContactUsForm.tsx`.
- **Everything else** (utils, api functions) is kebab-case: `fetch-user.ts`.

## Where code goes

Every slice (a folder under `features/`, `entities/`, or `widgets/`) has the
same internal shape:

```
slice-name/
├── index.ts   # public API — the ONLY way other code may import this slice
├── ui/        # components (.tsx / .astro)
├── model/     # types.ts, constants.ts, hooks/state
├── api/       # data-fetching functions
└── lib/       # slice-only helper logic (see "headless" rule below)
```

| What                  | Goes in                | Example                                    |
| --------------------- | ----------------------- | ------------------------------------------- |
| Interfaces / types    | `slice/model/types.ts`  | `entities/user/model/types.ts`             |
| Enums                 | `slice/model/constants.ts` | exported as `EFunnels`                  |
| UI components         | `slice/ui/`             | `ContactUsForm.tsx`                        |
| Data fetching         | `slice/api/`            | `fetch-user.ts`                            |
| Slice-only logic      | `slice/lib/`            | see "headless" rule below                  |
| Shared across slices  | `src/shared/...`        | `src/shared/lib/`, `src/shared/types/`     |

**Only `index.ts` is a valid import path into a slice.** Never reach into a
slice's internals from outside it:

```typescript
// Forbidden
import { ContactUsForm } from "@/features/contact-us/ui/ContactUsForm";

// Correct
import { ContactUsForm } from "@/features/contact-us";
```

**Data-fetching always lives in `slice/api/`** — never inline inside a
component.

**Headless UI:** keep logic (state, handlers, calculations) out of the
component file and in `slice/ui/` hooks or `slice/lib/` — the `.tsx`/`.astro`
file should mostly just render.

**Spacing:** use `margin-bottom` utilities for vertical spacing, never
`margin-top`. This keeps spacing consistent when sections get reordered.

**Use the shared design-system primitives, not raw HTML tags:**

| Instead of        | Use                              |
| ------------------ | --------------------------------- |
| `<a>`              | `Link` from `src/shared/ui/Link` |
| `<img>`            | `Image` from `src/shared/ui/image` |
| `<button>`         | `Button` from the design system  |
| `<h2>`, `<h3>`, `<h4>` | `Title` from `src/shared/ui/title`, with the correct `variant` |

**Content is never hardcoded.** Any copy a user sees (labels, headings,
button text, error messages) goes into `/public/locales/*` translation files,
not into a constant or JSX string. See `add-feature.md` step 5.

## ❌ Never do

- Import from a layer above the current one (e.g. `shared` importing from `widgets`).
- Import from inside a slice's `ui/`, `model/`, `api/`, or `lib/` folder from outside that slice — only `index.ts`.
- Put fetch/API calls directly in a component — they belong in `slice/api/`.
- Hardcode user-facing copy in a component or constants file.
- Use `margin-top` for spacing.
- Use raw `<a>`, `<img>`, or `<button>` tags instead of the shared `Link`, `Image`, and `Button` components.
- Use raw `<h2>`/`<h3>`/`<h4>` instead of `Title`.
- Edit `src/shared/api/cms/cms-schema.ts` by hand — it's generated (see `backend.md`).
- Use `any` in TypeScript — use `unknown` and narrow the type instead.
