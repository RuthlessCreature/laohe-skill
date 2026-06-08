# Quality Gates

## Gate 1: SPEC_READY

通过条件：

- 有 `00_SPEC.md`。
- 每条需求有 ID。
- 每条验收标准可测试。
- 有 Scope / Out of Scope。
- 有权限、状态、异常、边界条件。
- 有 Missing Questions 或明确假设。

失败处理：打回 Spec Owner。

## Gate 2: BUILD_READY

通过条件：

- Builder 有 `DEV_NOTES.md`。
- 有 changed files summary。
- 不存在明显无关大重构。
- 不存在 Builder 写 `qa/` 的情况。

失败处理：打回 Builder。

## Gate 3: DEV_SELF_CHECK_READY

通过条件：

- 有 `SELF_CHECK.md`。
- 有 `BUILD_RESULT.md`。
- 每个命令结果为 PASS / FAIL / NOT RUN / BLOCKED。
- NOT RUN 有原因。
- 失败项不被隐藏。

失败处理：如核心命令 FAIL 且无说明，打回 Builder。

## Gate 4: QA_PLAN_READY

通过条件：

- 有 `QA_TEST_PLAN.md`。
- 有 `QA_TEST_CASES.md`。
- 测试矩阵覆盖 happy / negative / boundary / RBAC / state / integration / regression。
- 每个 P0/P1 用例有预期结果和风险说明。

失败处理：打回 QA Planner。

## Gate 5: QA_RUN_READY

通过条件：

- 有 `QA_TEST_RUN.md`。
- 有 `ISSUE_LIST.md`。
- FAIL 有复现步骤。
- BLOCKED / SKIPPED 有原因。
- QA Decision 明确。

失败处理：如果无法执行，保持 QA_BLOCKED，不准进入 Release Judge。

## Gate 6: FIX_READY

通过条件：

- 有 `FIX_REPORT.md`。
- 有 `ISSUE_RESOLUTION.md`。
- FIXED 有 root cause / files changed / regression test。
- 未修复 issue 有风险说明。

失败处理：打回 Fixer。

## Gate 7: RELEASE_READY

通过条件：

- 无 open Blocker。
- Major 已关闭或有明确接受风险。
- 核心测试没有 SKIPPED / NOT RUN，或风险明确写入。
- 有部署 SOP 和回滚方案。
- 有 Release Decision。

失败处理：BLOCKED。
