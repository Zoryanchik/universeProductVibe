---
name: architecture-guard
description: Enforce FSD import direction, naming, and clean-code rules while editing.
---

Read `docs/vibe/architecture.md` and treat it as hard rules for any code you
write or edit in this repo. Before finishing, verify no import goes upward in
`app → pages-layer → widgets → features → entities → shared`.
