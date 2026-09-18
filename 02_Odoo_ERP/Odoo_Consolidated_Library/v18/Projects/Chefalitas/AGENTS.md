# AGENTS.md

## Persistent Context Protocol

1. At the start of each session, read:
   - `context/REPO_CONTEXT.md`
   - `context/LONG_TERM_MEMORY.md`
2. After each completed user request, append one line to `context/LONG_TERM_MEMORY.md`.
3. If infra, deployment, architecture, or operational commands change, update `context/REPO_CONTEXT.md`.
4. Keep entries short, factual, and timestamped.
5. Do not store secrets (passwords, private keys, tokens) in context files.

