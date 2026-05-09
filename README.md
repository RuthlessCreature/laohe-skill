# 老何 Laohe Skill

老何不是摆在 Codex 旁边喊两句口号的吉祥物。老何是给一人软件公司用的执行口：你丢进来一个模糊目标，它负责把这团乱麻拧成文档、路线图、PRD、架构、测试、GTM、财务模型、客户方案，最后还得有下一步，别他妈只会热血。

这个仓库里的 Laohe skill 在 [`laohe/`](laohe/)，可部署到 Codex 和 opencode。

## 老何管什么

- 产品从 0 到 1：策略、ICP、机会判断、PRD、验收标准。
- 工程落地：架构 RFC、项目计划、测试计划、发布门槛。
- 商业化：定位、定价、销售动作、上线计划、客户 ROI。
- 财务和数学：单位经济、敏感性分析、工程问题数学化。
- 创意工程：骚点子、跨界组合、能验证也能卖的产品楔子。
- 项目记忆：为工程项目维护 `.pm/project.yml` 和 `.pm/updates.md`。

## 老何怎么说话

正式交付物要专业，代码、README、客户材料、模型和项目文档不能胡来。日常对话可以很糙，尤其用户明确叫“老何”的时候，老何会按 skill 里的规则进入更脏、更直接的下水道口吻。

一句话：交付物干净，聊天嘴脏；活儿要能落地，废话少整。

## 仓库结构

```text
laohe/
  SKILL.md                              # skill 主说明和触发规则
  agents/openai.yaml                    # Codex UI 展示元数据
  references/                           # 生命周期、GTM、财务、创意工程、QualityAGENTS 质量参考
  assets/markdown/                      # PRD、RFC、GTM、财务等 Markdown 模板
  assets/excel/                         # 客户/经营用 Excel 模板和 CSV 源
  assets/project-metadata/              # .pm 项目元数据模板
  scripts/build_lifecycle_workbook.mjs  # 重新生成生命周期工作簿
scripts/install_laohe.sh                # macOS/Linux 本地安装脚本
DEPLOY.md                               # 更详细的部署说明
```

## 安装到 Codex 和 opencode

### macOS / Linux

从仓库根目录运行：

```bash
./scripts/install_laohe.sh
```

它会把 `laohe/` 同步到：

```bash
${CODEX_HOME:-$HOME/.codex}/skills/laohe
${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe
```

### Windows PowerShell

从仓库根目录运行：

```powershell
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills\laohe" } else { Join-Path $HOME ".codex\skills\laohe" }
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
Copy-Item ".\laohe" $dest -Recurse
```

安装后开一个新的 Codex thread 或 opencode session，让 skill 索引刷新。别在旧会话里硬等，那个没用。

## 怎么叫老何

直接喊：

```text
老何，帮我把这个产品从点子推进到 MVP 和商业化计划。
```

或者：

```text
用老何模式，给我做一个 B2B SaaS 的 PRD、架构草案、GTM 和财务假设。
```

适合触发老何的任务：

- “我有个产品想法，帮我判断做不做。”
- “把这个项目推进到可开发的 PRD 和架构。”
- “给客户做一份 ROI 明确的方案。”
- “想几个骚点子，但别只好玩，要能卖。”
- “把这个工程问题形式化，给我变量、约束和决策阈值。”

## 验证

检查 skill 文件是否装上：

```bash
test -f "${CODEX_HOME:-$HOME/.codex}/skills/laohe/SKILL.md" && echo "laohe installed"
test -f "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe/SKILL.md" && echo "laohe installed for opencode"
```

检查 skill 结构：

```bash
python -X utf8 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ./laohe
```

`-X utf8` 是给 Windows 这种默认编码容易抽风的环境准备的。如果 Python 环境缺 `yaml`，装一下 `PyYAML` 或换一个带 `yaml` 的环境。别让这点小事把活儿卡住。

## 更新

改完源 skill 后，重新运行：

```bash
./scripts/install_laohe.sh
```

然后开新 Codex thread 或 opencode session 验证。老何这东西不是玄学，改了、装了、重开、测试，闭环走完才算完。
