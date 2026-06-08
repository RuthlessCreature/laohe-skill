# Context Isolation Rules

## 为什么要隔离

同一个模型、同一个上下文、同一套假设，会倾向于验证自己刚刚实现的逻辑，而不是攻击它。

因此每轮必须进行上下文隔离。

## Builder → QA 的交接材料

QA 可以看：

```text
00_SPEC.md
01_CHANGELOG.md
02_FEATURE_LIST.md
03_WORKFLOW.md
04_USER_MANUAL.md
05_DEPLOYMENT_SOP.md
06_TEST_ACCOUNTS.md
builder/DEV_NOTES.md
builder/SELF_CHECK.md
builder/BUILD_RESULT.md
git diff / changed files summary
```

QA 不应该看：

```text
Builder 的完整聊天记录
Builder 的思考过程
Builder 与用户讨价还价的过程
Builder 的“应该没问题”解释
```

## QA → Fixer 的交接材料

Fixer 可以看：

```text
ISSUE_LIST.md
QA_TEST_RUN.md
REGRESSION_SUGGESTIONS.md
SPEC.md
相关日志 / 截图 / 复现步骤
```

Fixer 不应该改：

```text
QA_TEST_PLAN.md
QA_TEST_CASES.md
ISSUE_LIST.md
```

## Release Judge 输入

Release Judge 只能看证据链，不看口头承诺。
