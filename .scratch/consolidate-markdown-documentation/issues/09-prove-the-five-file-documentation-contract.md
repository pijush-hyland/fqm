# 09 — Prove the five-file documentation contract

**What to build:** Produce end-to-end evidence that the cleanup leaves exactly five retained Markdown files, preserves every selected fact once, removes stale and duplicate guidance from the editable human and domain documents, keeps exclusions and protected agent files unchanged, exposes no deployment secrets, and provides working navigation and commands.

**Blocked by:** 07 — Consolidate trustworthy human documentation; 08 — Preserve the agent and domain boundary.

**Status:** ready-for-human

- [x] Confirm the final in-scope inventory contains exactly the root human guide, root agent entry point, domain glossary, Claude adapter, and Copilot adapter, with no other in-scope Markdown file remaining.
- [ ] Account for every traceability row at one final heading, glossary entry, or protected unchanged agent file; fail if a selected fact is missing or detailed guidance has multiple owners.
- [x] Search `README.md` and `CONTEXT.md` for known stale claims including `npm start`, `ddl-auto=update`, `/actuator/health`, `ec2-setup-dev.sh`, Axios, obsolete backend `/api` mappings, and unsupported Docker or Kubernetes instructions; do not edit protected agent files based on their content.
- [x] Confirm every stale-term match is an intentional current warning; remove or reject every other match.
- [ ] Compare the excluded-directory path and content hashes with the baseline and fail if implementation changed any excluded content.
- [x] Compare `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` byte-for-byte with the frozen starting commit and fail on any content or newline difference.
- [ ] Resolve every relative Markdown link and prove that the canonical human guide supports understanding, startup, testing, configuration, deployment, and safe FCL migration without another Markdown document.
- [x] Execute every documented normal-path backend build and test command and require each command to exist and exit zero.
- [x] Execute every documented normal-path frontend test, lint, and production-build command and require each command to exist and exit zero.
- [x] Treat pre-existing, missing-prerequisite, and environment-dependent nonzero results as acceptance failures; record successful test-runner skips and their reported reasons.
- [x] Compare Markdown additions against deployment environment values without printing them and fail if any value was copied.
- [x] Run the repository's configured secret scanner when one exists and fail on any finding introduced by the cleanup.
- [x] Review the complete documentation diff for unsupported claims, unexplained cloud certainty, stale historical narrative, broken hierarchy, duplicate ownership, and deleted selected facts.
- [x] Record the completed traceability matrix and exact command outcomes in the implementation handoff or pull-request description, not in a new permanent repository document.
- [ ] Accept the cleanup only when every structural, executable, security, and manual review check passes.

## Answer

Acceptance was executed against frozen commit `6abed61558542c8ab13c755edf2a160b85533848` and rejected. The five-file structure, protected files, links, documented commands, stale-term scan, and security checks pass. Two strict gates do not: one excluded file differs at the byte level, and concurrent application/documentation changes removed the selected V1-V4 migration procedure and its executable support.

### Traceability matrix

| Selected row | Final owner | Result |
| --- | --- | --- |
| Product purpose | `README.md` / Overview | Present once |
| Backend/frontend architecture | `README.md` / Architecture | Present once |
| Ports | `README.md` / Architecture | Present once |
| Java, Spring Boot, React, and Vite versions | `README.md` / Architecture | Present once |
| Prerequisites | `README.md` / Prerequisites | Present once; Node range corrected to lockfile requirements |
| Manual startup | `README.md` / Local Quick Start | Present once |
| Test and build commands | `README.md` / Testing | Present once |
| Profiles and supported variables | `README.md` / Configuration | Present once |
| Security-sensitive configuration behavior | `README.md` / Configuration | Present once |
| Frontend environment convention | `README.md` / Configuration | Present once |
| Frontend debug gate | `README.md` / Configuration | Present once |
| Flyway schema ownership | `README.md` / Operations and Warnings | Present once |
| Hibernate validation | `README.md` / Operations and Warnings | Present once |
| Native `fetch` | `README.md` / Architecture | Present once |
| Capability-level API ownership | `README.md` / Repository Map | Present once |
| Vite proxy behavior | `README.md` / Architecture | Present once |
| Development deployment workflow and inputs | `README.md` / Deployment | Present once |
| S3-to-EC2 environment replacement | `README.md` / Deployment | Present once |
| Repository-configured resource choices | `README.md` / Deployment | Present once |
| Production security-group topology | `README.md` / Deployment | Present once |
| Frontend no-cache policy | `README.md` / Deployment | Present once |
| Unreliable root scripts | `README.md` / Operations and Warnings | Present once |
| Unsupported Actuator health check | `README.md` / Operations and Warnings | Present once |
| Centralized CORS | `README.md` / Configuration | Present once |
| V0-V4 migration paths and ordering | Intended `README.md` / Operations and Warnings | Missing after concurrent V0-only rewrite; executable V1-V4 files are deleted in the worktree |
| Java/SQL migration locations | Intended `README.md` / Operations and Warnings | Missing after concurrent V0-only rewrite |
| Six active FCL options | `README.md` / Database Baseline | Present once |
| Preflight, postflight, and recovery policy | Intended `README.md` / Operations and Warnings | Preflight/postflight procedure missing after concurrent V0-only rewrite |
| Seven FCL terms and avoided synonyms | `CONTEXT.md` | Present once each |
| Existing agent instructions | `AGENTS.md` | Protected blob unchanged |
| Existing Claude discovery | `CLAUDE.md` | Protected blob unchanged |
| Existing Copilot discovery | `.github/copilot-instructions.md` | Protected blob unchanged |
| Source navigation | `README.md` / Repository Map | Present once |

### Command outcomes

| Documented command | Outcome |
| --- | --- |
| `cd backend && mvn test` | Exit 0 |
| `cd backend && mvn clean package` | Exit 0; final Surefire reports contain 9 suites, 34 tests, 0 failures, 0 errors, and 18 Testcontainers/Docker-dependent skips |
| `cd frontend && npm test` | Exit 0; 4 files and 10 tests passed |
| `cd frontend && npm run lint` | Exit 0; 0 errors and 7 existing warnings |
| `cd frontend && npm run build` | Exit 0; TypeScript and Vite production build succeeded |

### Structural and security evidence

- Final in-scope inventory is exactly `.github/copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, and `README.md`.
- All three protected files match the frozen Git blobs byte-for-byte.
- The only relative Markdown link resolves.
- `npm start` and `/actuator/health` occur only in explicit warnings; `ddl-auto=validate` is current guidance. `ec2-setup-dev.sh`, Axios, Docker, Kubernetes, and obsolete backend mapping claims have no matches in the editable documents.
- No configured `gitleaks`, `trufflehog`, `detect-secrets`, `secretlint`, or `git-secrets` scanner exists.
- Two deployment environment files contributed 15 comparable values. Markdown additions had seven non-sensitive overlaps and zero sensitive-value matches; no values were printed.
- Excluded path sets are unchanged, but `.agents/skills/domain-modeling/SKILL.md` does not match the frozen raw SHA-256 digest. Git normalization produces the unchanged `HEAD` blob, identifying checkout line-ending drift, but the ticket requires raw path-and-content hash equality and therefore fails.

### Review

The Standards axis reported no findings. The Spec axis identified the Node prerequisite and the migration procedure. The Node prerequisite was corrected. The migration finding remains blocking because the worktree now deletes V1, V2, V3, V4, and their support code while `README.md` has concurrently been rewritten around a V0-only empty-database baseline. Resolving that drift requires a new human ownership decision; restoring or replacing those user-owned changes is outside this ticket.
