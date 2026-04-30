# Laohe Skill Deployment

This project contains a Codex skill at `laohe/`. Deploy by copying that whole folder to the Codex skills directory. The destination folder name must remain `laohe` because `SKILL.md` declares `name: laohe`.

## Local Codex on macOS/Linux

From this project root:

```bash
./scripts/install_laohe.sh
```

Equivalent manual command:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
rsync -a --delete ./laohe/ "${CODEX_HOME:-$HOME/.codex}/skills/laohe/"
```

Open a new Codex thread after installation so the skill index is refreshed. Then ask for Laohe explicitly, for example:

```text
用老何帮我把这个产品从点子推进到 MVP 和商业化计划。
```

## Other macOS/Linux Machines

1. Copy this project folder to the target machine with git, zip, rsync, or any file transfer tool.
2. Run from the project root:

```bash
./scripts/install_laohe.sh
```

3. Start a new Codex thread and invoke 老何.

## Windows PowerShell

From the project root on the target machine:

```powershell
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills\laohe" } else { Join-Path $HOME ".codex\skills\laohe" }
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
Copy-Item ".\laohe" $dest -Recurse
```

Open a new Codex thread after installation.

## Verify

Check the installed files:

```bash
test -f "${CODEX_HOME:-$HOME/.codex}/skills/laohe/SKILL.md" && echo "laohe installed"
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

This overwrites the installed `laohe` skill with the project copy.
