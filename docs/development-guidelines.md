# AI-Assisted Development Guidelines

Portable guidelines for solo developers building institutional-grade software with AI assistance.

---

## Core Principles

These principles explain WHY the rules exist. The rules are tactics; these are the strategy.

1. **Data is the primary intellectual asset** — spend 70% effort on data quality, not infrastructure
2. **Scientific rigor for domain projects** — every output must be defensible to regulators, peer reviewers, and risk committees
3. **Elegant simplicity over clever complexity** — you maintain this alone for years; clever code is a liability without a team to share context
4. **AI-assisted development is multiplicative** — subagents + MCP servers are force multipliers, not replacements for thinking
5. **No premature abstraction** — build what's needed now, refactor when patterns emerge; three similar lines > a premature helper
6. **APIs and databases first** — UI surfaces follow; get the data model right before building screens

---

## Workflow Rules

### 1. Plan Mode is Default
- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- Write detailed specs upfront to reduce ambiguity
- Use plan mode for verification and quality control, not just building
- If something goes sideways, stop and replan immediately

### 2. Subagent Strategy
- Use subagents liberally to keep the main context window lean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One track per subagent for focused execution
- For 10+ file implementations, use parallel subagents with complete context per group

### 3. Self-Improvement Loop
- After any user correction, update `tasks/lessons.md` with the pattern
- Write rules to prevent the same mistakes
- Ruthlessly iterate on these lessons until mistake rate drops
- **At every session start**, review `tasks/lessons.md` and cite relevant lessons when they apply
- **Lesson lifecycle:** Add after correction → Cite when it applies → After 3+ citations, promote to CLAUDE.md as a permanent rule → Delete from lessons.md after promotion

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Ask yourself: would a staff engineer approve this?
- Run tests, check logs, demonstrate correctness
- For Django: `pytest`, management commands, curl endpoints
- For Next.js: `npx next build`, browser check, API routes
- For both: full integration path (API → DB → response)

### 5. Demand Elegance, Simplicity Wins Ties
- For non-trivial changes, ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- **When elegance and simplicity conflict, choose simpler.** You need to maintain this alone for years. Clever code is a liability without a team to share context.
- Examples of choosing simpler: inline a 3-line helper rather than abstracting; use a flat config rather than a factory; duplicate 2 similar handlers rather than creating a generic dispatcher

### 6. Autonomous Bug Fixing
- Look at logs, errors, and failing tests, then resolve them
- Zero context-switching required from the user
- Go fix failing CI/tests without being told how

### 7. Task Management
- Plan first, write plan to `/tasks/todo.md`
- Check in with the user before implementation begins

### 8. Explain Changes
- Provide a high-level summary at critical steps
- Keep the user oriented without them needing to read every diff

### 9. Safe Changes
- Prefer additive changes over modifications to working code
- Never change working code without a test covering the existing behavior first
- Keep changes reversible — avoid destructive operations without confirmation

### 10. Session Continuity
- At session end, write a brief handoff note to `/tasks/handoff.md` covering: what was done, what's next, any gotchas
- At session start, read `tasks/handoff.md` + `tasks/lessons.md` before acting
- This is how a solo dev preserves context across days and weeks

### 11. Scope Discipline
- Stay within the current phase
- If a change touches a module outside the active phase, flag it and defer unless it's a bug fix
- Don't polish Phase 1 code while building Phase 3

### 12. Compliance Checkpoint
- At the end of each phase, verify deliverables against relevant standards
- Use a subagent to audit compliance before marking a phase complete
- Standards vary by project — define them in the project's CLAUDE.md

### 13. Secrets Hygiene
- **Never hardcode** secrets, API keys, passwords, or tokens in source code, docker-compose, or config files
- All secrets go in `.env` (gitignored). Provide `.env.example` with placeholder values for onboarding
- Use environment variable injection (`${VAR}` in docker-compose, `config("VAR")` in Django/decouple, `process.env.VAR` in Node)
- `.gitignore` must block: `.env`, `.env.*`, `*.key`, `*.pem`, `*.credentials`, `credentials.json`, `secrets.yml`
- Before every commit, mentally ask: "Would I be comfortable if this file leaked publicly?"
- For test commands, pass secrets via env vars inline — never persist them in committed scripts or IDE configs
