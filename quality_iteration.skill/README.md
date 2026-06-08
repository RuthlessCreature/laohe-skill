# quality_iteration.skill

一套用于 OpenCode / AI Coding Agent 的工程迭代质量控制 Skill。

它的目标不是让一个模型从头爽到尾，而是把每轮迭代拆成：

```text
Spec → Build → Dev Self Check → QA Plan → QA Execute → Fix → Release Judge
```

核心约束：

- Builder 只实现，不写最终 QA 结论。
- QA 只测试，不改代码。
- Fixer 只根据 Issue 修复，不改 QA 标准。
- Release Judge 只做发布裁决，不修代码。
- `SKIPPED` / `NOT RUN` 永远不算 `PASS`。
- 没有 `qa/ISSUE_LIST.md`，不允许进入 RC。
- 有 Blocker，禁止进入 RC。

## 目录结构

```text
quality_iteration.skill/
  SKILL.md
  manifest.json
  agents/
    00_orchestrator.md
    01_spec_owner.md
    02_builder.md
    03_dev_self_check.md
    04_qa_planner.md
    05_qa_executor.md
    06_fixer.md
    07_release_judge.md
  templates/
    iteration_index.template.md
    00_SPEC.template.md
    01_CHANGELOG.template.md
    02_FEATURE_LIST.template.md
    03_WORKFLOW.template.md
    04_USER_MANUAL.template.md
    05_DEPLOYMENT_SOP.template.md
    06_TEST_ACCOUNTS.template.md
    builder_DEV_NOTES.template.md
    builder_SELF_CHECK.template.md
    builder_BUILD_RESULT.template.md
    qa_QA_TEST_PLAN.template.md
    qa_QA_TEST_CASES.template.md
    qa_QA_TEST_RUN.template.md
    qa_ISSUE_LIST.template.md
    qa_REGRESSION_SUGGESTIONS.template.md
    fix_FIX_REPORT.template.md
    fix_ISSUE_RESOLUTION.template.md
    release_RELEASE_CHECKLIST.template.md
    release_RELEASE_DECISION.template.md
  rules/
    ownership.md
    gates.md
    severity.md
    issue_loop.md
    context_isolation.md
    anti_self_validation.md
  scripts/
    init_iteration.py
    gate_check.py
  examples/
    opencode_usage.md
    handoff_packets.md
```

## 推荐项目内目录

每一轮迭代建议生成：

```text
docs/{version}/
  00_SPEC.md
  01_CHANGELOG.md
  02_FEATURE_LIST.md
  03_WORKFLOW.md
  04_USER_MANUAL.md
  05_DEPLOYMENT_SOP.md
  06_TEST_ACCOUNTS.md

  builder/
    DEV_NOTES.md
    SELF_CHECK.md
    BUILD_RESULT.md

  qa/
    QA_TEST_PLAN.md
    QA_TEST_CASES.md
    QA_TEST_RUN.md
    ISSUE_LIST.md
    REGRESSION_SUGGESTIONS.md
    RETEST_REPORT.md

  fix/
    FIX_REPORT.md
    ISSUE_RESOLUTION.md

  release/
    RELEASE_CHECKLIST.md
    RELEASE_DECISION.md
```

## 快速使用

把整个 `quality_iteration.skill/` 放到你的项目根目录，或放进你的 agent skills 目录。

初始化一轮迭代：

```bash
python quality_iteration.skill/scripts/init_iteration.py --version 0.5.0-RC --project-root .
```

检查当前质量门：

```bash
python quality_iteration.skill/scripts/gate_check.py --version 0.5.0-RC --project-root .
```

给 OpenCode / coding agent 的启动语：

```text
加载 quality_iteration.skill。
项目根目录为当前目录。
目标版本：0.5.0-RC。
基准版本：docs/0.4.0-RC。
本轮目标：{写清楚目标}。
从 Orchestrator 开始，严格按质量门推进。
```
