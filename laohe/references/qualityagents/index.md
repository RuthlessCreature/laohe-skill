# QualityAGENTS Reference Pack

This pack was merged from the former root `hello/` folder. It is now a Laohe bundled reference, not a separate active skill set.

Use these files as quality gates, command workflows, and engineering checklists when they materially improve Laohe's delivery. Laohe's persona, artifact boundary, `.pm` metadata rules, and output contract remain primary.

## Precedence

1. User's latest request.
2. System/developer instructions and host-specific rules.
3. Laohe `SKILL.md` persona, artifact boundary, and execution loop.
4. This QualityAGENTS reference pack for stricter workflow and quality checks.

Do not let this pack override Laohe's casual voice. Do not wrap Laohe final answers in QualityAGENTS-specific output chrome unless the user explicitly asks for that format.

## When To Read

- Read `qualityagents.md` when a broad engineering task needs the full quality-driven workflow.
- Read `commands/<name>.md` only when the user explicitly invokes a `~command` such as `~plan`, `~build`, `~verify`, or `~auto`.
- Read `skills/<name>.md` only when the current work enters that domain, such as UI, tests, security, performance, data, API, debugging, review, or writing.
- Read `meta.md` only when maintaining or reasoning about the QualityAGENTS skill format itself.

## Command References

- `commands/auto.md` — auto-route and continue through idea/plan/build/verify/prd when explicitly invoked.
- `commands/build.md` — implementation workflow from current context or an existing plan package.
- `commands/clean.md` — clean temporary files and archive completed plan packages.
- `commands/commit.md` — conventional commit workflow and knowledge sync guidance.
- `commands/help.md` — command list and aliases.
- `commands/idea.md` — lightweight ideation without writing files.
- `commands/init.md` — initialize project knowledge and host rule files.
- `commands/loop.md` — autonomous metric-driven optimization loop.
- `commands/plan.md` — structured planning, clarification, and task decomposition.
- `commands/prd.md` — full PRD generation workflow.
- `commands/test.md` — write tests for a scope or recent changes.
- `commands/verify.md` — verification entrypoint for review, lint, tests, build, and fix loop.
- `commands/wiki.md` — create or sync project knowledge only.

## Quality References

- `skills/quality-api.md` — API contracts, status codes, validation, idempotency, and versioning.
- `skills/quality-arch.md` — architecture, refactors, module boundaries, and technical decisions.
- `skills/quality-data.md` — database schema, migrations, indexes, transactions, and ORM work.
- `skills/quality-debug.md` — root-cause debugging and repeatable feedback loops.
- `skills/quality-errors.md` — error handling, logging, retries, and failure semantics.
- `skills/quality-perf.md` — performance, caching, pagination, query optimization, and frontend perf.
- `skills/quality-reflect.md` — post-task lessons and knowledge extraction.
- `skills/quality-review.md` — code review dimensions and severity classification.
- `skills/quality-security.md` — authentication, secrets, input validation, and security-sensitive changes.
- `skills/quality-subagent.md` — subagent delegation patterns when the host allows delegation.
- `skills/quality-test.md` — TDD, coverage strategy, and test quality rules.
- `skills/quality-ui.md` — UI planning, implementation, visual validation, and design contract rules.
- `skills/quality-verify.md` — mandatory completion verification and evidence collection.
- `skills/quality-write.md` — professional writing, documentation, and structured text output.
