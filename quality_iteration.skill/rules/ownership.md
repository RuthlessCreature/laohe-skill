# Ownership Rules

## 文件归属

| Path | Owner | Editable By | Forbidden By |
|---|---|---|---|
| `00_SPEC.md` | Spec Owner | Spec Owner | Builder / QA / Fixer |
| `01_CHANGELOG.md` | Spec Owner | Spec Owner / Builder | QA / Release Judge |
| `02_FEATURE_LIST.md` | Spec Owner | Spec Owner | Builder / QA / Fixer |
| `03_WORKFLOW.md` | Spec Owner | Spec Owner | Builder / QA / Fixer |
| `04_USER_MANUAL.md` | Spec Owner | Spec Owner / Builder | QA |
| `05_DEPLOYMENT_SOP.md` | Spec Owner | Spec Owner / Builder | QA |
| `06_TEST_ACCOUNTS.md` | Spec Owner | Spec Owner / QA | Builder only if instructed |
| `builder/*` | Builder | Builder / Dev Self-Check | QA / Release Judge |
| `qa/*` | QA | QA Planner / QA Executor | Builder / Fixer |
| `fix/*` | Fixer | Fixer | QA / Release Judge |
| `release/*` | Release Judge | Release Judge | Builder / QA / Fixer |

## 绝对规则

1. Builder 不准写 `qa/`。
2. QA 不准改源码。
3. Fixer 不准修改 QA 标准。
4. Release Judge 不准修代码。
5. 任何 agent 不准把未运行项目写成 PASS。
