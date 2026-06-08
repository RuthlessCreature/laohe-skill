# OpenCode Usage Example

## 1. 初始化文档目录

```bash
python quality_iteration.skill/scripts/init_iteration.py \
  --version 0.5.0-RC \
  --base-version 0.4.0-RC \
  --project-name ATM \
  --project-root .
```

## 2. Orchestrator 启动语

```text
加载 quality_iteration.skill。
项目根目录为当前目录。
目标版本：0.5.0-RC。
基准版本：docs/0.4.0-RC。
本轮目标：{写清楚本轮要做什么}。

严格按以下阶段推进：
Spec Owner → Builder → Dev Self-Check → QA Planner → QA Executor → Fixer → QA Retest → Release Judge。

先判断当前阶段，不要跳步。
Builder 不准写 qa/。
QA 不准改代码。
Fixer 不准改 QA 标准。
Release Judge 不准修代码。
SKIPPED / NOT RUN 不算 PASS。
没有 ISSUE_LIST.md 不准进入 RC。
```

## 3. Builder Session 启动语

```text
加载 quality_iteration.skill/agents/02_builder.md。
你是 Builder Agent。
目标版本：0.5.0-RC。
只读取 docs/0.5.0-RC/00_SPEC.md、01_CHANGELOG.md、02_FEATURE_LIST.md、03_WORKFLOW.md 和当前代码库。
实现本轮功能。
输出代码 patch 和 docs/0.5.0-RC/builder/DEV_NOTES.md。
禁止写 qa/，禁止宣布 QA_PASS。
```

## 4. QA Session 启动语

```text
加载 quality_iteration.skill/agents/04_qa_planner.md 和 05_qa_executor.md。
你是独立 QA，不是开发者。
目标版本：0.5.0-RC。
只读取 docs/0.5.0-RC 下的规格、说明、builder 交付物和 git diff。
不要读取 Builder 的完整聊天记录。
先生成 QA_TEST_PLAN.md 和 QA_TEST_CASES.md。
然后执行测试，输出 QA_TEST_RUN.md、ISSUE_LIST.md、REGRESSION_SUGGESTIONS.md。
禁止修改代码。
```

## 5. Fixer Session 启动语

```text
加载 quality_iteration.skill/agents/06_fixer.md。
你是 Fixer Agent。
只根据 docs/0.5.0-RC/qa/ISSUE_LIST.md 和 QA_TEST_RUN.md 修复。
禁止修改 QA 标准，禁止删除失败测试，禁止直接关闭 issue。
输出代码 patch、fix/FIX_REPORT.md、fix/ISSUE_RESOLUTION.md。
```

## 6. Release Judge Session 启动语

```text
加载 quality_iteration.skill/agents/07_release_judge.md。
你是 Release Judge。
只根据证据链判断是否允许进入 RC。
不得修代码，不得修改测试结果。
输出 release/RELEASE_CHECKLIST.md 和 release/RELEASE_DECISION.md。
```
