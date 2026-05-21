# Laohe And Xiaohe Skill Deployment

This project contains two sibling skills:

- Laohe at `laohe/`: full Laohe operating pack with the original sewer-style casual persona.
- Xiaohe at `xiaohe/`: clean-voiced sibling entrypoint that reuses Laohe's shared templates, references, scripts, project intelligence cache, and QualityAGENTS pack.

Deploy both folders side by side. The destination folder names must remain `laohe` and `xiaohe` because each `SKILL.md` declares its own skill name.

## Local Codex And opencode On macOS/Linux

From this project root:

```bash
./scripts/install_laohe.sh
```

The script installs both skills to both hosts:

```bash
${CODEX_HOME:-$HOME/.codex}/skills/laohe
${CODEX_HOME:-$HOME/.codex}/skills/xiaohe
${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe
${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/xiaohe
```

Equivalent manual commands:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
rsync -a --delete --exclude='.DS_Store' ./laohe/ "${CODEX_HOME:-$HOME/.codex}/skills/laohe/"
rsync -a --delete --exclude='.DS_Store' ./xiaohe/ "${CODEX_HOME:-$HOME/.codex}/skills/xiaohe/"

mkdir -p "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}"
rsync -a --delete --exclude='.DS_Store' ./laohe/ "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe/"
rsync -a --delete --exclude='.DS_Store' ./xiaohe/ "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/xiaohe/"
```

Open a new Codex thread or opencode session after installation so the skill index is refreshed. Then ask for Laohe or Xiaohe explicitly, for example:

```text
用老何帮我把这个产品从点子推进到 MVP 和商业化计划。
小何，帮我把这个产品从点子推进到 MVP 和商业化计划。
```

## Other macOS/Linux Machines

1. Copy this project folder to the target machine with git, zip, rsync, or any file transfer tool.
2. Run from the project root:

```bash
./scripts/install_laohe.sh
```

3. Start a new Codex thread or opencode session and invoke 老何.

## Windows PowerShell

From the project root on the target machine:

```powershell
$codexSkills = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $HOME ".codex\skills" }
$laoheDest = Join-Path $codexSkills "laohe"
$xiaoheDest = Join-Path $codexSkills "xiaohe"
New-Item -ItemType Directory -Force $codexSkills | Out-Null
if (Test-Path $laoheDest) { Remove-Item $laoheDest -Recurse -Force }
if (Test-Path $xiaoheDest) { Remove-Item $xiaoheDest -Recurse -Force }
Copy-Item ".\laohe" $laoheDest -Recurse
Copy-Item ".\xiaohe" $xiaoheDest -Recurse
```

Open a new Codex thread or opencode session after installation.

## Verify

Check the installed files:

```bash
test -f "${CODEX_HOME:-$HOME/.codex}/skills/laohe/SKILL.md" && echo "laohe installed"
test -f "${CODEX_HOME:-$HOME/.codex}/skills/xiaohe/SKILL.md" && echo "xiaohe installed"
test -f "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe/SKILL.md" && echo "laohe installed for opencode"
test -f "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/xiaohe/SKILL.md" && echo "xiaohe installed for opencode"
```

Optional structure validation from this project root:

```bash
PYTHONPATH=/tmp/laohe-pyyaml python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ./laohe
PYTHONPATH=/tmp/laohe-pyyaml python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ./xiaohe
```

If `PyYAML` is not available, install it into a temp target or use any Python environment that has `yaml`.

## Updating

After editing the source skill, rerun:

```bash
./scripts/install_laohe.sh
```

This overwrites the installed `laohe` and `xiaohe` skills with the project copies.
