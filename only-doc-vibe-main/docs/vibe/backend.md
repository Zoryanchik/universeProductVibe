# Backend and Data

There are two separate backends. Only one of them is something you can call
from a vibe-coding machine.

## CMS (Strapi) — public, this is your live API reference

The content backend is a Strapi CMS. Its Swagger docs are public and
browsable without logging in — use them to see what content and endpoints
exist:

```
https://giving-crown-044b1c58a6.strapiapp.com/documentation/v1.0.0
```

Open that URL whenever you need to know what fields a page/response has, or
what a CMS endpoint returns, before writing a fetch function.

### Generated types

TypeScript types for every CMS response are generated (not hand-written)
into:

```
src/shared/api/cms/cms-schema.ts
```

**Never edit this file by hand** — it will be overwritten. Regenerate it
with:

```bash
npm run generate-api-schema
```

Run this whenever the CMS schema changes and your local types feel stale
(a field is missing, a response type doesn't match what Swagger shows).

Use the typed client from `src/shared/api/cms/cms-http-client.ts` together
with these generated types — see `add-feature.md` step 4 for where the
fetch call itself should live.

## App backend — internal, VPN-only, do not call it

The application backend (`api-dev.only-doc.com`) is **internal and
VPN-only**. It is never a link you can open directly, and it is not
something a vibe-coding session should call, curl, or point a fetch at.

If a task seems to need this backend — ask the team. Don't try to reach it
yourself.

### Testing a hypothesis that needs this backend

You don't have to wait for backend access to try an idea. **Mock the data** at
the `api/` layer and build/test the UI against fake-but-realistic responses.
See [`mock-data.md`](mock-data.md) — this is the intended way to validate a
hypothesis before any real backend work exists.
