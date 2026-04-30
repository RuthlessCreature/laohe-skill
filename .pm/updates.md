# Project Updates

## 2026-04-29

- Created project-local `.pm` metadata for the Laohe skill project.
- Updated workspace rules to remove the fixed Windows workspace restriction and write metadata in the current project directory.
- Updated the Laohe skill to maintain project-local `.pm/project.yml` and `.pm/updates.md` after material engineering or product changes.
- Added reusable `.pm` metadata templates under `laohe/assets/project-metadata/`.
- Added `DEPLOY.md` and `scripts/install_laohe.sh` so Laohe can be installed locally or on other machines.
- Added a conversation-style boundary: generated artifacts remain professional, while Laohe's daily chat can be crude, profane, and lowbrow when the persona is active.
- Strengthened the Laohe persona so informal non-artifact replies default to crude Laohe-style language instead of merely allowing it.
- Added explicit trigger phrases so direct address like `老何，帮我...` is treated as Laohe skill activation.
- Added `references/profanity-keywords.md` with 200 maintainable profanity keywords and updated Laohe to use high-density sewer-style casual dialogue.
- Expanded `references/profanity-keywords.md` from 200 to 1000 maintainable profanity keywords using user-provided seed terms and safe non-hateful combinations.

## 2026-04-30

- Strengthened Laohe's informal conversation rule to require a vulgar marker every 3-5 Chinese words or every short clause, with exceptions for high-risk or explicitly clean-language contexts.
- Added a root `README.md` in Laohe's voice covering scope, voice boundaries, repository structure, Codex installation, usage prompts, verification, and update flow.
