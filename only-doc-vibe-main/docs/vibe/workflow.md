# Workflow: Plan High, Build Low

The core idea: use your strongest available model to think, and a faster or
cheaper model to type. Don't use one model for both — it's slower and more
expensive than it needs to be, and it blurs the one checkpoint that actually
catches mistakes.

## The loop

1. **Plan with the strongest model you have access to, in plan mode.**
   Plan mode means read-only — no file edits yet. The output is a design and
   a task list, not code. Switching models is `/model` in Claude Code, or
   the model picker in Cursor.
2. **Review the plan before handoff.** Read it yourself (or have the strong
   model re-check itself) before switching models. This is the one point
   where a missing requirement, scope creep, or an over-engineered approach
   gets caught — catch it here, not after code is written.
3. **Switch to a faster/cheaper model and implement task-by-task.** The
   build model reads the plan, does not re-derive it, and works through the
   task list one item at a time.
4. **The build model never redesigns architecture.** It executes what the
   plan says. If, partway through, it wants to change the approach, restructure
   files differently than planned, or touch something outside the plan's file
   list — that's a stop condition. Stop, go back to the strong model, re-plan.

## Why this shape

- A plan file that lists exact steps and files is something a different
  model (or a fresh session) can pick up without re-reading everything that
  led to it. Keep the plan self-contained.
- Scope the plan to an explicit file list where possible. If the build model
  wants to touch a file that isn't listed, that's worth a second look, not
  an automatic yes.
- Not every change needs the full gate. A one-line fix or an isolated,
  well-defined tweak can skip straight to the faster model. Reserve the
  plan-mode gate for anything touching architecture, state, or multiple
  files.
- Treat "which model does which job" as a swappable setting, not something
  wired into every prompt — the pairing of strong-model/fast-model will
  change over time as better and cheaper models become available. This doc
  intentionally never names a specific model — whichever is strongest/fastest
  at the time you're reading this is the one to use.

## Quick checklist

- [ ] Planning happened in plan mode — no edits until the plan is approved.
- [ ] The plan is a written artifact (design + task list), not just chat history.
- [ ] Someone reviewed the plan before the build model started.
- [ ] The build model worked task-by-task from the plan.
- [ ] If the build model wanted to redesign anything, work stopped and went back to planning.
