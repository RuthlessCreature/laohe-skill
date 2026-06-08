#!/usr/bin/env python3
"""Lightweight quality gate checker for quality_iteration.skill artifacts."""
from __future__ import annotations

import argparse
from pathlib import Path
import re

REQUIRED = [
    "00_SPEC.md",
    "builder/DEV_NOTES.md",
    "builder/SELF_CHECK.md",
    "builder/BUILD_RESULT.md",
    "qa/QA_TEST_PLAN.md",
    "qa/QA_TEST_CASES.md",
    "qa/QA_TEST_RUN.md",
    "qa/ISSUE_LIST.md",
    "release/RELEASE_DECISION.md",
]

WARN_IF_EMPTY_SECTIONS = [
    "## 8. Acceptance Criteria",
    "## 9. Edge Cases",
    "## 3. Test Results",
    "## Issue Status Summary",
]


def read(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def _field(block: str, name: str) -> str:
    for line in block.splitlines():
        line = line.strip()
        prefix = f"- {name}:"
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return ""


def has_open_blocker(issue_text: str) -> bool:
    blocks = re.split(r"\n## ISSUE-", issue_text)
    for b in blocks[1:]:
        status = _field(b, "Status")
        severity = _field(b, "Severity")
        # Ignore template placeholder lines such as "OPEN / FIXED / ...".
        if severity == "Blocker" and status in {"OPEN", "REOPENED"}:
            return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", required=True)
    parser.add_argument("--project-root", default=".")
    args = parser.parse_args()

    root = Path(args.project_root).resolve() / "docs" / args.version
    print(f"Checking: {root}")

    missing = []
    for rel in REQUIRED:
        if not (root / rel).exists():
            missing.append(rel)

    if missing:
        print("\nMISSING ARTIFACTS:")
        for m in missing:
            print(f"- {m}")
    else:
        print("\nAll required high-level artifacts exist.")

    issues = read(root / "qa" / "ISSUE_LIST.md")
    if issues:
        if has_open_blocker(issues):
            print("\nGATE: BLOCKED — open Blocker issue detected.")
        else:
            print("\nGATE: no obvious open Blocker detected by lightweight parser.")
    else:
        print("\nGATE: no ISSUE_LIST.md content; cannot approve RC.")

    qa_run = read(root / "qa" / "QA_TEST_RUN.md")
    # Lightweight scan: warn only when SKIPPED / NOT RUN appears as an actual table result,
    # not merely in the template text.
    for line in qa_run.splitlines():
        if "|" not in line or "---" in line or "Total" in line:
            continue
        if re.search(r"\|\s*(SKIPPED|NOT RUN)\s*\|", line):
            print("\nWARNING: QA run contains SKIPPED / NOT RUN. These are not PASS.")
            break

    release_decision = read(root / "release" / "RELEASE_DECISION.md")
    approved_line = re.search(r"^APPROVED_FOR_RC\s*$", release_decision, flags=re.MULTILINE)
    if approved_line and has_open_blocker(issues):
        print("\nERROR: Release approved while Blocker appears open. This violates gates.")

    print("\nDone. This script is a lightweight guard, not a replacement for QA.")


if __name__ == "__main__":
    main()
