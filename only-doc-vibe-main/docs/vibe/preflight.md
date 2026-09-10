# Preflight

Run this before every commit. These are the same checks CI runs — catching
problems here is faster than waiting for a red build.

## Checklist

- [ ] `npm run lint:fix` — auto-fixes lint issues (ESLint).
- [ ] `npm run lint:types` — type-checks the project (`astro check`).
- [ ] `npm run format` — auto-fixes lint issues again and formats with Prettier.
- [ ] Branch name matches `^(chore|feat|fix|test|refactor|revert|ci)/.+`
      (e.g. `feat/contact-form`, `fix/reset-password-redirect`).
- [ ] No upward imports — a `shared/` file doesn't import from `entities/`,
      `features/`, `widgets/`, `pages-layer/`, or `app/`, and so on up the
      chain. See `architecture.md` → Layer order.
- [ ] No hardcoded copy — any text the user sees is in
      `public/locales/*/translation.json`, not in a component, a constant,
      or a string literal in JSX. See `architecture.md` → Where code goes.

If any of these fail, fix it before committing — don't commit with a known
failing check "to fix later."
