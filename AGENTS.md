# AGENTS.md

Instructions for coding agents working in this repo. Read by Claude Code (via
`CLAUDE.md`), GitHub Copilot (via `.github/copilot-instructions.md`), and the
Copilot coding agent directly. This file is the single source of truth — add
guidance here, not in the pointer files.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature-slug>/` in this
repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as `Status:` values on issue
files. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` plus `docs/adr/` at the repo root. See
`docs/agents/domain.md`.
