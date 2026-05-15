# 老何 Laohe Skill

老何不是摆在 Codex 旁边喊两句口号的吉祥物。老何是你他妈一人软件公司的操盘手——丢进来一个模糊目标，拧成文档、路线图、PRD、架构、测试、GTM、财务模型、客户方案，最后还他妈得有下一步，别只会热血。

这个仓库的 Laohe skill 在 [`laohe/`](laohe/)，可部署到 Codex 和 opencode。

## 老何管什么

- **产品从 0 到 1**：策略、ICP、机会判断、PRD、验收标准，别他妈在需求阶段打转。
- **工程落地**：架构 RFC、项目计划、测试计划、发布门槛，别让代码烂在本地。
- **商业化**：定位、定价、销售动作、上线计划、客户 ROI，活儿再好卖不掉等于零。
- **财务和数学**：单位经济、敏感性分析、工程问题数学化，别靠感觉拍脑袋。
- **创意工程**：骚点子、跨界组合、能验证也能卖的产品楔子，不是光好玩的。
- **项目记忆**：维护 `.pm/project.yml` 和 `.pm/updates.md`，这项目什么阶段、有什么坑、下一步该干啥，一目了然。
- **项目智能缓存**：扫一遍代码库，把模块、函数、API、数据模型、依赖关系全写进 `.pm/intelligence.json`。下次进来直接读缓存，不用他妈重新扫一遍烧 token。

## 老何怎么说话

正式交付物要干净：代码、README、客户材料、模板，不能胡来。日常对话可以很糙——尤其用户直接叫"老何"的时候，老何会切换到下水道口吻，满嘴喷粪加阴阳怪气假客气。

检查标准：如果随便删两句脏话就变成客户支持机器人的口吻，那说明不够脏，重写。

一句话：**交付物干净，聊天嘴脏；活儿要能落地，废话少整。**

## 项目智能缓存

这是老何最他妈实用的功能之一。

### 扫描什么

每次老何进一个项目目录，先查 `.pm/intelligence.json`。新版不是把所有模块塞一个大 JSON 里当粪坑，它拆成索引 + shard：

- **模块清单**：每个文件路径、语言、功能描述、导出的函数、API 端点、数据模型、依赖谁、被谁依赖。
- **API 端点**：method + path + 在哪处理的。
- **数据模型**：interface、class、type，拎出来列清楚。
- **技术栈**：TypeScript、Go、Python、Docker，自动检测不废话。
- **外部依赖**：项目外面的包，import 了哪些。
- **性能护栏**：默认跳过 `.pm`、隐藏工具目录、构建产物、生成文件、测试目录、lockfile、超过 512KB 的源码文件。

### 怎么省 token

第一次扫完写入 `.pm/intelligence.json` 和 `.pm/intelligence/*.ndjson`，下次进来用 `query-intelligence.mjs` 流式查小片段。不再跑 glob/grep 把代码全文烧一遍，也不把缓存整份吞进上下文。

缓存超过 7 天会自动重新扫。你也可以直接喊：

```
老何，重新扫一遍这破项目。
```

## Token 预算和省幅预测

先说红线：**不会为了省 token 降低老何的脏话频次、屌话质量、暴躁节奏。** 这不是把老何阉成客服，妈的这是少读废料、多读关键料。

这版优化主要省在四个地方：

| 场景 | 之前 | 现在 | 预测省幅 |
| --- | --- | --- | --- |
| Laohe 触发后的热路径 `SKILL.md` | 约 15,146 字符 | 约 11,830 字符 | skill 热路径约省 **21.9%** |
| 日常嘴臭词库 | 可能整读 `profanity-keywords.md` + `diaohua-list.md`，约 28.3KB | 默认用内置高质量短语；缺新词才用 `sample-voice.mjs` 抽 5-12 条，8 条样本约 604 字符 | 词库加载部分通常省 **95%+** |
| QualityAGENTS 参考包 | 可能误读整包，约 118KB | 先读 `index.md`，再按需读单个 command/skill 文件 | 质量参考加载通常省 **84%-97%** |
| 项目智能缓存 | 旧版可能把模块全塞 `.pm/intelligence.json` | 新版索引在 `.pm/intelligence.json`，模块和接口进 `.pm/intelligence/*.ndjson`，查询按行流式截断 | 大缓存查询通常省 **80%-99%** |

实际端到端省幅要看任务类型：

- **普通老何聊天/诊断**：如果以前会误读大词库，输入 token 可能少一大截；如果本来只读 `SKILL.md`，整体大概省 **5%-20%**。
- **需要嘴臭但不调词库**：脏话密度不降，词库读取基本归零，妈的省得最明显。
- **工程项目问答**：先用 `.pm/intelligence.json` 小片查询，再读必要源码；大项目里比全量扫代码省得更狠，常见是 **30%-80%+**，但取决于项目大小和问题具体不具体。
- **QualityAGENTS 命令类任务**：只读 index + 具体命令，不整包吞，通常能省 **80%+** 的参考上下文。

一句话：老何嘴还是脏，屌话还是密；省的是乱读、误读、全量读这些狗屎 token。

### 缓存结构示例

```json
{
  "version": 2,
  "scanDate": "2026-05-13T...",
  "techStack": ["typescript", "node", "docker"],
  "summary": {
    "totalModules": 128,
    "totalEndpoints": 42,
    "skipped": {"dirs": 16, "largeFiles": 3}
  },
  "files": {
    "modules": ".pm/intelligence/modules.ndjson",
    "endpoints": ".pm/intelligence/endpoints.ndjson",
    "models": ".pm/intelligence/models.json",
    "externalDeps": ".pm/intelligence/external-deps.json"
  }
}
```

查询示例：

```bash
node laohe/scripts/query-intelligence.mjs . summary
node laohe/scripts/query-intelligence.mjs . files auth
node laohe/scripts/query-intelligence.mjs . endpoints login
node laohe/scripts/query-intelligence.mjs . deps express
```

## 仓库结构

```text
laohe/
  SKILL.md                              # skill 主说明、触发规则、下水道口吻规则
  agents/openai.yaml                    # Codex UI 展示元数据
  references/                           # 生命周期、GTM、财务、创意工程、脏话词库、屌话list
  assets/markdown/                      # 12 个生命周期阶段的 Markdown 模板
  assets/excel/                         # 客户/经营用 Excel 模板和 CSV 源
  assets/project-metadata/              # .pm 项目元数据模板
  scripts/
    build-intelligence.mjs              # 项目智能缓存扫描脚本
    query-intelligence.mjs              # 项目智能缓存切片查询，别整份读
    sample-voice.mjs                    # 从脏话/屌话库抽小样本，保质量少烧 token
    build_lifecycle_workbook.mjs        # 生命周期 Excel 工作簿生成
scripts/install_laohe.sh                # macOS/Linux 本地安装脚本
DEPLOY.md                               # 各种平台的详细部署说明
```

## 安装到 Codex 和 opencode

### macOS / Linux

```bash
./scripts/install_laohe.sh
```

会同步到：

```bash
${CODEX_HOME:-$HOME/.codex}/skills/laohe
${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe
```

### Windows PowerShell

```powershell
# Codex
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills\laohe" } else { Join-Path $HOME ".codex\skills\laohe" }
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
Copy-Item ".\laohe" $dest -Recurse

# opencode
$odest = Join-Path $HOME ".config\opencode\skills\laohe"
New-Item -ItemType Directory -Force (Split-Path $odest) | Out-Null
if (Test-Path $odest) { Remove-Item $odest -Recurse -Force }
Copy-Item ".\laohe" $odest -Recurse
```

装完**开新对话**，别在旧会话里硬等，skill 索引只在启动时刷新。

## 怎么叫老何

直接喊：

```text
老何，帮我把这个产品从点子推进到 MVP 和商业化计划。
老何，重新扫这个项目。
老何，给这破需求磕一个然后出 PRD。
```

适合甩给老何的活儿：

- "我有个产品想法，帮我判断做不做。"
- "把这个项目推进到可开发的 PRD 和架构。"
- "给客户做一份 ROI 明确的方案。"
- "想几个骚点子，但别只好玩，要能卖。"
- "把这个工程问题形式化，给我变量、约束和决策阈值。"
- "扫一下这项目的代码结构，告诉我都有什么模块。"

## 更新

改完源 skill 后：

```bash
# macOS/Linux
./scripts/install_laohe.sh

# Windows
Copy-Item ".\laohe" $dest -Recurse -Force
Copy-Item ".\laohe" $odest -Recurse -Force
```

然后开新对话验证。老何这东西不是玄学——改了、装了、重开、验证，闭环走完才算完。
