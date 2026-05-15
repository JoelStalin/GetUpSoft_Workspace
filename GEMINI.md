# Gemini Workspace Rules

Use the same workspace policy as Codex.

Before touching a project:

1. Run `.\scripts\agent_start.ps1`.
2. If needed, re-run `.\scripts\workspace_bootstrap.ps1`.
3. Read `task-ledger\skill-recommendations.md`.
4. Normalize the request with `.\scripts\caveman_route.ps1`.
5. Use the most specific skill set from `.agents\skills`.

Preferred skills:

- `agency-agents` for coordination
- `webapp-testing` for frontend/browser validation
- `authorized-security-testing` for defensive checks only

The workspace keeps shared skills in `.agents\skills` and the pinned inventory in `skills-lock.json`.

For design work, use the shared Stitch MCP manifest in `mcp-servers.shared.json` and validate it with `.\scripts\stitch_mcp_bootstrap.ps1`.
