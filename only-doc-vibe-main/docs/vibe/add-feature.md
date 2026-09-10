# Adding a Feature

A step-by-step guide to adding a new feature slice. Read `architecture.md`
first if you haven't — this doc assumes you know the layer order and slice
shape.

## Steps

**1. Decide the layer.**

- Is it a reusable business concept (a "Document", a "User")? → `entities/`
- Is it a user action (a form, a toggle, an upload)? → `features/`
- Is it a composite block made of several features (a navbar, a footer)? → `widgets/`

Most new work is a `features/` slice — a form, a button that triggers an
action, a small self-contained piece of UI with its own logic.

**2. Create the slice folder.**

```bash
mkdir -p src/features/my-feature/{ui,model,api,lib}
touch src/features/my-feature/index.ts
```

**3. Export only through `index.ts`.**

Nothing outside the slice may import from `ui/`, `model/`, `api/`, or `lib/`
directly. `index.ts` is the only door in:

```typescript
// src/features/my-feature/index.ts
export { MyFeatureForm } from "./ui/MyFeatureForm";
export type { IMyFeatureContent } from "./model/types";
```

**4. Put any API/CMS call in `api/`.**

If the feature needs data from the CMS, write the fetch function in
`slice/api/`, typed against the generated CMS schema. The CMS Swagger docs
(public, browsable, no login) are the reference for what's available —
see `backend.md` for the URL and how to regenerate types.

**5. Add copy to the locale files — never hardcode it.**

Any text the user sees goes into `public/locales/en/translation.json`, and
the same key must be added to every other locale file
(`public/locales/{de,es,fr,pl,pt,ar,id}/translation.json`). Never put a
label or message directly in a component or a constants file.

**6. Run preflight before committing.**

See `preflight.md` for the exact commands. Don't skip this — it's the same
thing CI checks.

## Worked example: `contact-us` feature

This is a real, small slice already in the repo — a good template to copy
the shape from. Path: `src/features/contact-us/`.

```
src/features/contact-us/
├── index.ts               # public API
├── api/
│   └── services.ts        # the CMS/backend call for submitting the form
├── model/
│   ├── types.ts           # IContactUsFormContent, etc.
│   └── useContactUs.ts     # headless hook: form state + submit handler
└── ui/
    └── ContactUsForm.tsx   # renders the form, uses the hook above
```

`index.ts` — the only exports anyone else is allowed to import:

```typescript
export type { IContactUsFormContent } from "./model/types";
export { ContactUsForm } from "./ui/ContactUsForm";
```

Notice the pattern: `useContactUs.ts` in `model/` holds the logic (state,
validation, calling the API), and `ContactUsForm.tsx` in `ui/` stays mostly
about rendering — this is the "headless" split from `architecture.md`. The
API call lives in `api/services.ts`, not inline in the component. All text
shown in the form (labels, button text, error messages) comes from the
locale files, not from a constant in this slice.

If you're building something similar, copy this folder's shape, rename it,
and swap in your own logic.
