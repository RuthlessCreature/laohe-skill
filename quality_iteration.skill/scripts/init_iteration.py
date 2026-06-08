#!/usr/bin/env python3
"""Initialize a quality_iteration docs/{version} folder from templates."""
from __future__ import annotations

import argparse
from pathlib import Path
from datetime import datetime


def render(text: str, **ctx: str) -> str:
    for k, v in ctx.items():
        text = text.replace("{" + k + "}", v)
    return text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", required=True)
    parser.add_argument("--project-root", default=".")
    parser.add_argument("--project-name", default="UNKNOWN_PROJECT")
    parser.add_argument("--base-version", default="UNKNOWN_BASE")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    skill_root = Path(__file__).resolve().parents[1]
    templates = skill_root / "templates"
    target = project_root / "docs" / args.version

    mappings = {
        "iteration_index.template.md": "ITERATION_INDEX.md",
        "00_SPEC.template.md": "00_SPEC.md",
        "01_CHANGELOG.template.md": "01_CHANGELOG.md",
        "02_FEATURE_LIST.template.md": "02_FEATURE_LIST.md",
        "03_WORKFLOW.template.md": "03_WORKFLOW.md",
        "04_USER_MANUAL.template.md": "04_USER_MANUAL.md",
        "05_DEPLOYMENT_SOP.template.md": "05_DEPLOYMENT_SOP.md",
        "06_TEST_ACCOUNTS.template.md": "06_TEST_ACCOUNTS.md",
        "builder_DEV_NOTES.template.md": "builder/DEV_NOTES.md",
        "builder_SELF_CHECK.template.md": "builder/SELF_CHECK.md",
        "builder_BUILD_RESULT.template.md": "builder/BUILD_RESULT.md",
        "qa_QA_TEST_PLAN.template.md": "qa/QA_TEST_PLAN.md",
        "qa_QA_TEST_CASES.template.md": "qa/QA_TEST_CASES.md",
        "qa_QA_TEST_RUN.template.md": "qa/QA_TEST_RUN.md",
        "qa_ISSUE_LIST.template.md": "qa/ISSUE_LIST.md",
        "qa_REGRESSION_SUGGESTIONS.template.md": "qa/REGRESSION_SUGGESTIONS.md",
        "qa_RETEST_REPORT.template.md": "qa/RETEST_REPORT.md",
        "fix_FIX_REPORT.template.md": "fix/FIX_REPORT.md",
        "fix_ISSUE_RESOLUTION.template.md": "fix/ISSUE_RESOLUTION.md",
        "release_RELEASE_CHECKLIST.template.md": "release/RELEASE_CHECKLIST.md",
        "release_RELEASE_DECISION.template.md": "release/RELEASE_DECISION.md",
    }

    ctx = {
        "version": args.version,
        "project_name": args.project_name,
        "base_version": args.base_version,
        "created_at": datetime.now().isoformat(timespec="seconds"),
    }

    for template_name, rel_out in mappings.items():
        src = templates / template_name
        dst = target / rel_out
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists() and not args.overwrite:
            print(f"SKIP exists: {dst}")
            continue
        dst.write_text(render(src.read_text(encoding="utf-8"), **ctx), encoding="utf-8")
        print(f"WRITE {dst}")

    print(f"\nInitialized iteration docs at: {target}")


if __name__ == "__main__":
    main()
