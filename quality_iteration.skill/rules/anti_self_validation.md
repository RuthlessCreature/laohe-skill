# Anti Self-Validation Rules

## 定义

自证正确指：同一个 agent / session 完成实现、测试设计、测试执行、发布通过判断。

## 禁止模式

```text
Builder 写代码
Builder 写 QA 测试
Builder 跑测试
Builder 宣布 QA_PASS
```

## 允许模式

```text
Builder 写代码
Dev Self-Check 做开发侧验证
QA Planner 独立设计测试
QA Executor 独立执行测试
Fixer 根据 issue 修复
QA Executor 复测
Release Judge 基于证据裁决
```

## 判断标准

以下情况都视为高风险自证：

- 测试用例直接来自实现细节，而不是 SPEC。
- 测试大量 mock 掉真实依赖。
- 没有真实浏览器 / API / DB 验证。
- SKIPPED 很多但最终 PASS。
- 开发报告和 QA 报告同一个 session 生成。
- 没有 ISSUE_LIST 却进入 RC。
