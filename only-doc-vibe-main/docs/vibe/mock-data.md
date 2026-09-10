# Mocking backend data for hypothesis testing

Some hypotheses need the **app backend** (`apiHttpClient`, base `…/api/v1`) — auth,
file processing, AI summarizer, user data. That backend is internal (VPN-only), so
from a vibe machine those calls fail. To test the **idea** without waiting on the
backend, return **fake (mock) data** shaped exactly like the real response.

Rule of thumb: **mock the `api/` layer, never the UI.** Components stay unaware —
they call the same hook/service, it just returns canned data while you test.

## Where mocks live

Data in this project lives in each slice's `api/` folder:

```
features/<name>/api/
  services.ts     # functions that call the backend (apiHttpClient)
  api-hooks.ts    # React hooks that wrap services
  <name>.mock.ts  # ← your mock data (typed, same shape as the real response)
```

Mock at `services.ts` — that is the single boundary between the app and the backend.

## The toggle

One switch controls all mocks so you never ship them by accident:

```ts
// src/shared/config/mocks.ts
export const USE_MOCKS = true; // flip to false to use the real backend
```

## The pattern (3 steps)

1. **Write typed mock data** next to the service, matching the real return type:

```ts
// features/user-profile/api/user-profile.mock.ts
import type { UserProfile } from "../model/types";

export const mockUserProfile: UserProfile = {
  id: "mock-1",
  email: "tester@example.com",
  plan: "pro",          // ← the value your hypothesis needs (e.g. a paid user)
  createdAt: "2026-01-01T00:00:00.000Z",
};
```

2. **Short-circuit the service** behind the toggle:

```ts
// features/user-profile/api/services.ts
import { apiHttpClient } from "@/shared/api/api-http-client";
import { API_ROUTES } from "@/shared/api/api-routes";
import { USE_MOCKS } from "@/shared/config/mocks";
import { mockUserProfile } from "./user-profile.mock";
import type { UserProfile } from "../model/types";

export const getUserProfile = async (): Promise<UserProfile> => {
  if (USE_MOCKS) return mockUserProfile; // ← test the idea, no backend needed
  const { data } = await apiHttpClient.get(API_ROUTES.USER_ME);
  return data;
};
```

3. **Build the UI against the hook/service as usual.** It works offline with the
   mock, and swaps to the real backend later by deleting the mock branch (or setting
   `USE_MOCKS = false`).

## Faking delays, errors, empty states

Hypotheses often test how the UI behaves, not just the happy path:

```ts
if (USE_MOCKS) {
  await new Promise((r) => setTimeout(r, 800)); // simulate a slow network
  // throw new Error("mock failure");           // test the error state
  return mockUserProfile;
}
```

## Rules

- **Type your mocks.** Use the same type as the real response so the UI can't drift
  from reality. If you don't know the shape, check the
  [CMS Swagger](https://giving-crown-044b1c58a6.strapiapp.com/documentation/v1.0.0)
  or ask the team for the backend contract.
- **Mock only the `api/` layer.** Never scatter fake data inside components or stores.
- **Label it a mock.** File name ends in `.mock.ts`; keep the real call in the `else`
  branch so replacing the mock is one line.
- **One toggle.** All mocks respect `USE_MOCKS`. Set it back to `false` before you
  consider the feature "real".
- **When the hypothesis is validated** and needs the real backend — that's a team
  task. See [`backend.md`](backend.md).

## Advanced (optional)

For intercepting real network calls without editing services, [MSW](https://mswjs.io)
(Mock Service Worker) is the standard tool. It is more setup than the pattern above —
prefer the `api/`-layer mock for quick hypothesis tests; reach for MSW only if you
need many endpoints mocked at once. Ask a tutor before going this route.
