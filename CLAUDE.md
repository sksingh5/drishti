# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

dicrav2 — greenfield project. Architecture and commands to be documented as the project develops.

## Core Principles
1. Data is the primary intellectual asset — 70% effort on data quality, not infrastructure
2. Scientific rigor for domain projects — defensible to regulators, peer reviewers, risk committees
3. Elegant simplicity over clever complexity — maintain alone for years
4. AI-assisted development is multiplicative — subagents + MCP are force multipliers
5. No premature abstraction — build what's needed now, refactor when patterns emerge
6. APIs and databases first — UI surfaces follow

## Workflow Rules
See [docs/development-guidelines.md](docs/development-guidelines.md) for the full portable version.

1. **Plan mode is default:** Enter plan mode for any non-trivial task (3+ steps or architectural decisions). Write detailed specs upfront. Use plan mode for verification/QC too. If something goes sideways, stop and replan immediately.
2. **Subagent strategy:** Use subagents liberally to keep the main context window lean. Offload research, exploration, and parallel analysis. One track per subagent for focused execution.
3. **Self-improvement loop:** After any user correction, update `tasks/lessons.md` with the pattern. At every session start, review lessons and cite relevant ones. Lifecycle: add → cite 3+ times → promote to CLAUDE.md → delete from lessons.
4. **Verification before done:** Never mark a task complete without proving it works. Would a staff engineer approve this? Run tests, check logs, demonstrate correctness.
5. **Demand elegance, simplicity wins ties:** For non-trivial changes, ask "is there a more elegant way?" When elegance and simplicity conflict, choose simpler. Skip for obvious fixes.
6. **Autonomous bug fixing:** Look at logs, errors, and failing tests, then resolve them. Zero context-switching from the user.
7. **Task management:** Plan first, write plan to `/tasks/todo.md`. Check in with the user before implementation.
8. **Explain changes:** High-level summary at critical steps.
9. **Safe changes:** Prefer additive over destructive. Never change working code without a test covering existing behavior first. Keep changes reversible.
10. **Session continuity:** At session end, write handoff to `/tasks/handoff.md` (what was done, what's next, gotchas). At session start, read handoff + lessons before acting.
11. **Scope discipline:** Stay within the current phase. Flag and defer out-of-scope changes unless they're bug fixes.
12. **Compliance checkpoint:** At phase end, audit deliverables against relevant standards. Use a subagent for compliance audit.
13. **Secrets hygiene:** Never hardcode secrets in source code or config files. All secrets in `.env` (gitignored), `.env.example` for onboarding. Before every commit: "Would I be comfortable if this file leaked publicly?"
