# Context Folder

Purpose: keep long-term project memory so future sessions can resume fast.

## Files

- `LONG_TERM_MEMORY.md`: chronological log of user requests and outcomes.
- `REPO_CONTEXT.md`: technical snapshot of the repository and operations.
- `scripts/add_memory.ps1`: helper to append memory entries consistently.

## Usage

1. Read `REPO_CONTEXT.md` + latest entries in `LONG_TERM_MEMORY.md` at session start.
2. After each request, append one row to `LONG_TERM_MEMORY.md`.
3. When repo architecture or operations change, update `REPO_CONTEXT.md`.

## Important

- This memory is local to the repository.
- Do not store secrets in these files.

