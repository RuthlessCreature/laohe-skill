#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="${1:-$PROJECT_ROOT/laohe}"
DEST_ROOT="${CODEX_HOME:-$HOME/.codex}/skills"
DEST_DIR="$DEST_ROOT/laohe"

if [[ ! -f "$SOURCE_DIR/SKILL.md" ]]; then
  echo "Missing SKILL.md in source skill directory: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$DEST_ROOT"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$SOURCE_DIR/" "$DEST_DIR/"
else
  rm -rf "$DEST_DIR"
  mkdir -p "$DEST_DIR"
  cp -R "$SOURCE_DIR/." "$DEST_DIR/"
fi

echo "Installed laohe skill to: $DEST_DIR"
echo "Open a new Codex thread to refresh skill discovery."
