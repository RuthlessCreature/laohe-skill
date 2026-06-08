# Issue Loop Rules

## 标准闭环

```text
QA finds issue
  ↓
ISSUE_LIST.md OPEN
  ↓
Fixer fixes issue
  ↓
ISSUE_RESOLUTION.md FIXED claim
  ↓
QA retests
  ↓
RETEST_REPORT.md VERIFIED_FIXED / REOPENED
  ↓
Regression test added or suggested
```

## Issue 状态

- `OPEN`：QA 已确认问题，等待修复。
- `FIXED`：Fixer 声称已修复，但需要 QA 复测。
- `VERIFIED_FIXED`：QA 复测通过。
- `REOPENED`：QA 复测失败。
- `WONT_FIX`：不修，必须有业务理由。
- `NEEDS_PRODUCT_DECISION`：需求冲突，等待 Spec Owner。
- `CANNOT_REPRODUCE`：无法复现，必须写环境和证据。

## 回归规则

每个人工发现或 QA 发现的问题都必须至少产出一个：

- 自动化 regression test；或
- 手动 regression checklist；或
- SPEC 补充；或
- QA_TEST_CASES 补充。

## 禁止

- Fixer 直接关闭 issue。
- Builder 修改 ISSUE_LIST。
- QA 因为 Fixer 说修好了就关闭。
- 把 CANNOT_REPRODUCE 当成 FIXED。
