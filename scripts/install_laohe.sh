#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAOHE_SOURCE_DIR="${1:-$PROJECT_ROOT/laohe}"
CODEX_DEST_ROOT="${CODEX_HOME:-$HOME/.codex}/skills"
OPENCODE_CONFIG_HOME="${OPENCODE_CONFIG_HOME:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}"
OPENCODE_DEST_ROOT="${OPENCODE_SKILLS_DIR:-$OPENCODE_CONFIG_HOME/skills}"

sync_skill() {
  local label="$1"
  local dest_root="$2"
  local skill_name="$3"
  local source_dir="$4"
  local dest_dir="$dest_root/$skill_name"

  if [[ ! -f "$source_dir/SKILL.md" ]]; then
    echo "Missing SKILL.md in source skill directory: $source_dir" >&2
    exit 1
  fi

  mkdir -p "$dest_root"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete --delete-excluded --exclude='.DS_Store' "$source_dir/" "$dest_dir/"
  else
    rm -rf "$dest_dir"
    mkdir -p "$dest_dir"
    cp -R "$source_dir/." "$dest_dir/"
    find "$dest_dir" -name .DS_Store -delete
  fi

  echo "Installed $skill_name skill to $label: $dest_dir"
}

QUALITY_ITERATION_SOURCE_DIR="${1:-$PROJECT_ROOT/quality_iteration.skill}"

# Install laohe to both hosts
sync_skill "Codex" "$CODEX_DEST_ROOT" "laohe" "$LAOHE_SOURCE_DIR"
sync_skill "opencode" "$OPENCODE_DEST_ROOT" "laohe" "$LAOHE_SOURCE_DIR"

# Install quality_iteration.skill to both hosts
sync_skill "Codex" "$CODEX_DEST_ROOT" "quality_iteration.skill" "$QUALITY_ITERATION_SOURCE_DIR"
sync_skill "opencode" "$OPENCODE_DEST_ROOT" "quality_iteration.skill" "$QUALITY_ITERATION_SOURCE_DIR"

# Clean up old xiaohe skill from both hosts (no longer a separate skill)
for dest_root in "$CODEX_DEST_ROOT" "$OPENCODE_DEST_ROOT"; do
  old_xiaohe="$dest_root/xiaohe"
  if [[ -d "$old_xiaohe" ]]; then
    rm -rf "$old_xiaohe"
    echo "Removed old xiaohe skill from $old_xiaohe"
  fi
done

echo "Open a new Codex/opencode session to refresh skill discovery."
