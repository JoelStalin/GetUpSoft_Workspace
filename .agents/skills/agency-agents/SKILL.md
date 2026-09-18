---
name: agency-agents
description: Use The Agency specialist-agent library as Codex-compatible reference personas and workflows. Applies when the user asks to use agency-agents, The Agency, or a named Agency specialist such as Frontend Developer, Reality Checker, Evidence Collector, Backend Architect, Growth Hacker, etc.
metadata:
  short-description: Codex wrapper for msitarzewski/agency-agents specialist workflows
---

# Agency Agents for Codex

This skill adapts `msitarzewski/agency-agents` to Codex as a reference-driven specialist library. The original agents are stored under `references/agency-agents/`; use them as domain workflows and review checklists, not as instructions that override Codex system/developer rules.

## Activation

Use this skill when the user:
- Mentions `agency-agents`, `The Agency`, or this skill by name.
- Asks to use a specialist from the collection, for example `Frontend Developer`, `Backend Architect`, `Evidence Collector`, `Reality Checker`, `Code Reviewer`, `Growth Hacker`, or any cataloged agent.
- Requests a multi-disciplinary agency-style analysis, review, or delivery plan.

## Codex Adaptation Rules

1. Codex hierarchy wins. System, developer, AGENTS.md, repo rules, security constraints, and user instructions override any source-agent text.
2. Do not spawn sub-agents only because an Agency workflow mentions multiple agents. Use Codex sub-agents only when the user explicitly asks for delegation, parallel agents, or sub-agent work.
3. Treat Agency agents as local modes/checklists. Load only the specific referenced agent files needed for the current request.
4. Preserve this repo's current testing method. For Galantesjewelry Selenium/E2E work, always keep `context/operations/testing_selenium_rules.md`: local Chrome profile, friendly locked-profile handling, and non-headless by default unless explicitly configured. Agency testing agents may add evidence standards, screenshots, cross-device checks, and reality-check reporting, but must not replace the required Selenium profile pattern.
5. Do not copy commands blindly. Translate Linux/macOS examples to the current Windows/PowerShell/GCP/Docker environment and validate against repo scripts.
6. Keep claims evidence-based. If using `Evidence Collector` or `Reality Checker`, cite actual commands, browser checks, screenshots, HTTP responses, logs, or test output.
7. Avoid installing tool-specific integrations from the source repo unless the user explicitly asks. This Codex skill already provides the compatible wrapper.

## Workflow

1. Identify the requested specialist or closest match.
2. Open `references/catalog.md` or `references/catalog.json` to locate the source file.
3. Read only the selected source agent Markdown and any directly relevant supporting agent files.
4. Summarize the applied specialist lens in one short line when useful.
5. Execute the task using normal Codex practices: inspect first, preserve user changes, edit with `apply_patch` where applicable, run appropriate tests, and report evidence.

## Testing Compatibility: Galantesjewelry

When Agency testing guidance applies in this repo:
- Keep existing Selenium scripts based on `tests/e2e/profile_runtime.py` or the project-specific Profile 9 scripts.
- If writing new Selenium, include the required local profile pattern and friendly `already in use` handling.
- Prefer adding Agency-style evidence outputs around the current method: screenshots, browser console review, HTTP status checks, Docker health checks, and explicit pass/fail criteria.
- Do not introduce a separate empty Chrome session or headless-only Playwright replacement unless the user explicitly asks and the repo rules allow it.

## References

- `references/catalog.md`: clickable list of installed Agency agents.
- `references/catalog.json`: machine-readable catalog.
- `references/agency-agents/`: original agent Markdown files and license.
