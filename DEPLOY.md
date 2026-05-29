# Laohe Skill Deployment

This project contains a single skill `laohe/` that supports two voice modes:

- **老何 mode**: triggered by "老何，...", "用老何模式". Full capability with furious sewer casual voice.
- **小何 mode**: triggered by "小何，...", "用小何模式", "Xiaohe". Same full capability with clean direct voice.

Modes can be switched mid-conversation: "喷粪"/"下水道"(→ sewer) or "文明点"/"说人话"/"clean"(→ clean). No re-skill-load required.

## Local Codex And opencode On macOS/Linux

From this project root:

```bash
./scripts/install_laohe.sh
```

The script installs laohe/ to both hosts and removes any old xiaohe/ skill:

```
${CODEX_HOME:-$HOME/.codex}/skills/laohe
${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe
```

Equivalent manual command:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
rsync -a --delete --exclude='.DS_Store' ./laohe/ "${CODEX_HOME:-$HOME/.codex}/skills/laohe/"

mkdir -p "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}"
rsync -a --delete --exclude='.DS_Store' ./laohe/ "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe/"
```

If you have an old `xiaohe/` skill installed from a previous version, the install script cleans it up automatically. To remove it manually:

```bash
rm -rf "${CODEX_HOME:-$HOME/.codex}/skills/xiaohe"
rm -rf "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/xiaohe"
```

Open a new Codex thread or opencode session after installation so the skill index is refreshed. Then ask for either mode:

```text
老何，帮我把这个产品从点子推进到 MVP 和商业化计划。
小何，帮我把这个产品从点子推进到 MVP 和商业化计划。
```

## Other macOS/Linux Machines

1. Copy this project folder to the target machine with git, zip, rsync, or any file transfer tool.
2. Run from the project root:

```bash
./scripts/install_laohe.sh
```

3. Start a new Codex thread or opencode session and invoke 老何 or 小何.

## Windows PowerShell

From the project root on the target machine:

```powershell
$codexSkills = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $HOME ".codex\skills" }
$laoheDest = Join-Path $codexSkills "laohe"
New-Item -ItemType Directory -Force $codexSkills | Out-Null
if (Test-Path $laoheDest) { Remove-Item $laoheDest -Recurse -Force }
Copy-Item ".\laohe" $laoheDest -Recurse

# Clean up old xiaohe
$oldXiaohe = Join-Path $codexSkills "xiaohe"
if (Test-Path $oldXiaohe) { Remove-Item $oldXiaohe -Recurse -Force }
```

Open a new Codex thread or opencode session after installation.

## Verify

Check the installed files:

```bash
test -f "${CODEX_HOME:-$HOME/.codex}/skills/laohe/SKILL.md" && echo "codex laohe ok"
test -f "${OPENCODE_SKILLS_DIR:-${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}/skills}/laohe/SKILL.md" && echo "opencode laohe ok"
```

Optional structure validation from this project root:

```bash
PYTHONPATH=/tmp/laohe-pyyaml python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ./laohe
```

If `PyYAML` is not available, install it into a temp target or use any Python environment that has `yaml`.

## Updating

After editing the source skill, rerun:

```bash
./scripts/install_laohe.sh
```

This overwrites the installed `laohe` skill with the project copy and cleans up old `xiaohe/` artifacts.
