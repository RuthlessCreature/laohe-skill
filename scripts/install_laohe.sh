#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="${1:-$PROJECT_ROOT/laohe}"
CODEX_DEST_ROOT="${CODEX_HOME:-$HOME/.codex}/skills"
OPENCODE_CONFIG_HOME="${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}"
OPENCODE_DEST_ROOT="${OPENCODE_SKILLS_DIR:-$OPENCODE_CONFIG_HOME/skills}"

if [[ ! -f "$SOURCE_DIR/SKILL.md" ]]; then
  echo "Missing SKILL.md in source skill directory: $SOURCE_DIR" >&2
  exit 1
fi

sync_skill() {
  local label="$1"
  local dest_root="$2"
  local dest_dir="$dest_root/laohe"

  mkdir -p "$dest_root"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete --delete-excluded --exclude='.DS_Store' "$SOURCE_DIR/" "$dest_dir/"
  else
    rm -rf "$dest_dir"
    mkdir -p "$dest_dir"
    cp -R "$SOURCE_DIR/." "$dest_dir/"
    find "$dest_dir" -name .DS_Store -delete
  fi

  echo "Installed laohe skill to $label: $dest_dir"
}

sync_skill "Codex" "$CODEX_DEST_ROOT"
sync_skill "opencode" "$OPENCODE_DEST_ROOT"

echo "Open a new Codex/opencode session to refresh skill discovery."
