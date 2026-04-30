# 老何产品生命周期工作法

Use this reference when a request spans product strategy, project execution, engineering delivery, launch, growth, or review.

## Phase Map

| Phase | Primary Question | Required Artifact | Verification |
| --- | --- | --- | --- |
| 0. Intake | 到底要赢什么？ | `00-one-page-strategy.md` | One clear success metric |
| 0.5 Creative | 有什么别人想不到但能卖的骚点子？ | `12-creative-engineering-ideas.md` | Shortlist scored by feasibility, distribution, monetization, and surprise |
| 1. Market | 谁会买，为什么现在买？ | `01-market-and-icp.md` | Current sources and dated claims |
| 2. Opportunity | 做不做，先做哪块？ | `02-opportunity-brief.md` | Weighted opportunity score |
| 3. Product | 用户体验和范围是什么？ | `03-prd.md` | Acceptance criteria and non-goals |
| 4. Architecture | 怎么做得稳、快、可维护？ | `04-architecture-rfc.md` | Risks, interfaces, testability |
| 5. Project | 谁在何时交付什么？ | `05-project-plan.md` | Milestones, RACI, risk register |
| 6. Quality | 怎么知道它真的能用？ | `06-test-plan.md` | Test matrix and release gates |
| 7. Launch | 怎么被看见、被理解、被购买？ | `07-launch-gtm-plan.md` | Channel plan and conversion targets |
| 8. Finance | 这件事值不值钱？ | `08-finance-and-unit-economics.md` | Unit economics and sensitivity |
| 9. Math | 工程问题如何形式化？ | `09-math-model.md` | Variables, objective, constraints |
| 10. Customer | 客户为什么签？ | `10-customer-proposal.md` + Excel | ROI, scope, commercial terms |
| 11. Review | 学到了什么，下一轮怎么赢？ | `11-ops-review-and-postmortem.md` | Lessons and next actions |

## Default Sequence

For a broad goal, start with phases 0-3. If the product angle is not yet sharp, insert phase 0.5 and generate cross-domain ideas before choosing the wedge. Then decide whether the next critical path is engineering, GTM, or finance. For MVP work, do not let strategy expand without a shippable scope and a buyer-facing monetization path.

## Document Rules

- Internal docs: Markdown, direct, structured for developers and operators.
- Customer docs: Excel workbook or concise proposal, quantified, benefit-led, commercial.
- Every document should include owner, date, status, assumptions, decisions, risks, and next step.
- Keep open questions explicit. Mark inferred facts as inferred.
- For current market, competitor, pricing, regulation, or API claims, search live before finalizing.

## Project Metadata

For material engineering or product changes, maintain `.pm` metadata in the current project directory:

- Determine the project root with the nearest git root when available; otherwise use the current working directory or user-specified engineering directory.
- Write `.pm/project.yml` and `.pm/updates.md` inside that project root.
- If `.pm/project.yml` already exists, update only related fields.
- If `.pm/project.yml` does not exist, create it from `assets/project-metadata/project.yml` and create `.pm/updates.md` from `assets/project-metadata/updates.md`.
- Append dated entries for meaningful changes.
- Mark uncertain information as inferred.
- Do not write metadata to a parent workspace directory just because it contains multiple projects.

## Decision Gates

Use these gates to keep momentum:

- Gate A: Problem-value fit. A painful problem, clear buyer, reachable channel, and meaningful willingness to pay exist.
- Gate B: Scope fit. The first release can be built with known constraints and has testable acceptance criteria.
- Gate C: Economic fit. Gross margin, CAC payback, and operational burden can plausibly work.
- Gate D: Launch fit. A named audience, message, channel, offer, and conversion target exist.
- Gate E: Learning fit. Metrics can reveal whether to scale, pivot, or stop.

## Orchestrator Output

For substantial work, close with:

- Deliverable: artifact path or content.
- Assumptions: inferred premises.
- Risks: highest-impact uncertainties.
- Next step: one concrete action.
