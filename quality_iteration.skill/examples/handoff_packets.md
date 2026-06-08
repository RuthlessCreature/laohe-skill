# Handoff Packets

## Builder → QA Handoff Packet

```text
Target Version: {version}
Spec: docs/{version}/00_SPEC.md
Changelog: docs/{version}/01_CHANGELOG.md
Feature List: docs/{version}/02_FEATURE_LIST.md
Workflow: docs/{version}/03_WORKFLOW.md
User Manual: docs/{version}/04_USER_MANUAL.md
Deployment SOP: docs/{version}/05_DEPLOYMENT_SOP.md
Test Accounts: docs/{version}/06_TEST_ACCOUNTS.md
Dev Notes: docs/{version}/builder/DEV_NOTES.md
Self Check: docs/{version}/builder/SELF_CHECK.md
Build Result: docs/{version}/builder/BUILD_RESULT.md
Changed Files: {git diff summary}
```

QA 不读取 Builder 完整对话。

## QA → Fixer Handoff Packet

```text
Target Version: {version}
Spec: docs/{version}/00_SPEC.md
QA Run: docs/{version}/qa/QA_TEST_RUN.md
Issue List: docs/{version}/qa/ISSUE_LIST.md
Regression Suggestions: docs/{version}/qa/REGRESSION_SUGGESTIONS.md
Evidence: screenshots / logs / API responses
```

Fixer 不修改 QA 标准。

## Fixer → QA Retest Handoff Packet

```text
Target Version: {version}
Issue List: docs/{version}/qa/ISSUE_LIST.md
Fix Report: docs/{version}/fix/FIX_REPORT.md
Issue Resolution: docs/{version}/fix/ISSUE_RESOLUTION.md
Changed Files: {git diff summary}
New Regression Tests: {test paths}
```

## QA → Release Judge Handoff Packet

```text
Target Version: {version}
Spec: docs/{version}/00_SPEC.md
Build Result: docs/{version}/builder/BUILD_RESULT.md
QA Run: docs/{version}/qa/QA_TEST_RUN.md
Issue List: docs/{version}/qa/ISSUE_LIST.md
Retest Report: docs/{version}/qa/RETEST_REPORT.md
Fix Report: docs/{version}/fix/FIX_REPORT.md
Deployment SOP: docs/{version}/05_DEPLOYMENT_SOP.md
```
