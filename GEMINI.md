# Gemini Workspace Rules

Use the same workspace policy as Codex.

## Mandatory Rules (Non-Negotiable)
1. **DatingBot PRO Continuity**: NEVER remove, deprecate, or hide existing system functions (WhatsApp, Bumble, Orca Chat, etc.) without explicit user approval through DOUBLE VALIDATION.
2. Before touching a project:
   - Run `.\scripts\agent_start.ps1`.
   - If needed, re-run `.\scripts\workspace_bootstrap.ps1`.
3. Read `task-ledger\skill-recommendations.md`.
4. Normalize the request with `.\scripts\caveman_route.ps1`.
5. Use the most specific skill set from `.agents\skills`.

Preferred skills:

- `agency-agents` for coordination
- `webapp-testing` for frontend/browser validation
- `authorized-security-testing` for defensive checks only

The workspace keeps shared skills in `.agents\skills` and the pinned inventory in `skills-lock.json`.

For design work, use the shared Stitch MCP manifest in `mcp-servers.shared.json` and validate it with `.\scripts\stitch_mcp_bootstrap.ps1`.

## Safety & Infrastructure Mandates

- **Tunnel Safety:** NEVER stop, restart, or modify network tunnels (e.g., `cloudflared`, SSH tunnels, VPNs) without explicitly confirming **TWICE** with the user. Accidental lockout is a critical risk.
