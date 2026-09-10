---
name: mock-data
description: Fake backend data at the api/ layer to test a product hypothesis without the real backend.
---

Read `docs/vibe/mock-data.md` and follow it. When a hypothesis needs the app
backend (`apiHttpClient`) that isn't reachable from a vibe machine, mock the
response at the slice's `api/services.ts` behind the `USE_MOCKS` toggle — never
inside components or stores. Type every mock to match the real response shape,
name the file `<name>.mock.ts`, and keep the real call in the `else` branch so
it swaps back in one line.
