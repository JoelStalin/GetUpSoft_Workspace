# Claude Workspace Rules

This workspace uses shared skills and a bootstrap step before project work.

Required sequence:

1. Run `.\scripts\agent_start.ps1`.
2. If needed, re-run `.\scripts\workspace_bootstrap.ps1`.
3. Review `task-ledger\skill-recommendations.md`.
4. Run the prompt through `.\scripts\caveman_route.ps1`.
5. Select the most specific skills from `.agents\skills`.

Use `agency-agents` for multiagent coordination, `webapp-testing` for browser QA, and `authorized-security-testing` for defensive security validation only.

For design projects, use `mcp-servers.shared.json` plus `.\scripts\stitch_mcp_bootstrap.ps1` to validate Stitch MCP before generating UI work.
