# GetUpSoft Workspace Agent Rules

This workspace is multiagent by default. EVERY agent (Gemini, Claude, Codex, ChatGPT, Copilot, Cursor, OpenClaw, AutoGen, NemoClaw, Rowboat, Hermes) must follow the shared policy below.

## Shared Structural Memory (WORKSPACE.map) - GETUPSOFT ECOSYSTEM STANDARD
- **MANDATORY FOR GETUPSOFT**: Any agent working within `GetUpSoft_Workspace` must run `python scripts/update_repo_map.py` after structural changes.
- **CORPORATE SCOPE**: This is the mandatory navigation standard for all GetUpSoft sub-projects. It does not apply to other personal or system directories on the PC.
- **EFFICIENCY**: READ `WORKSPACE.map` FIRST. No exceptions.

## Start-of-work sequence

1. Run `.\scripts\agent_start.ps1`.
2. If needed, re-run `.\scripts\workspace_bootstrap.ps1`.
3. Read `task-ledger\skill-recommendations.md` for the current project families.
4. Normalize the task prompt with `.\scripts\caveman_route.ps1` before selecting skills.
5. Use the shared skill bundle in `.agents\skills`.
6. Prefer the most specific skill set available for the project family.

## Shared skills

- `.agents\skills` is the live shared bundle for the workspace.
- `skills-lock.json` is the pinned inventory.
- Any new skill installed in Codex should be propagated into the workspace bundle.

## Skill selection policy

- Always review the available skills before starting a project task.
- Use `agency-agents` for role coordination, review flow, and handoffs.
- Use `webapp-testing` for browser, UI, or Selenium-style validation.
- Use `authorized-security-testing` only for explicitly authorized defensive checks.
- Avoid generic skills when a more specific workspace skill exists.

## Project recommendation policy

- The workspace keeps project-family recommendations in `task-ledger/skill-recommendations.json` and `.md`.
- The generator groups projects by family and recommends the best-fit skills per family.
- Re-run the generator when the workspace layout or skill bundle changes.

## Design projects

- Use the shared Stitch MCP manifest in `mcp-servers.shared.json` for any project that needs UI or design work.
- Run `.\scripts\stitch_mcp_bootstrap.ps1` to validate Stitch availability.
- If `GOOGLE_CLOUD_PROJECT` is not set, Stitch is scaffolded but not ready.

## Operational rule

If a task touches a project, the agent must check the bootstrap output before writing code or running tests.

## Infrastructure boundaries

- `galantesjewelry` / Galantes Jewelry is a GetUpSoft client product, not GetUpSoft production infrastructure.
- Do not deploy, sync, tunnel, host, or test GetUpSoft workspace services on any Galantes Jewelry server, VM, container, tunnel, DNS route, or project.
- GetUpSoft production/server access must use the GetUpSoft hosts only, currently `getupsoft-lan` and `ssh.getupsoft.com.do`, unless the user explicitly provides a different GetUpSoft-owned target.

## Tunnel safety policy

- Never stop, remove, restart, replace, recreate, disable, or reroute any Cloudflare tunnel, SSH tunnel, reverse proxy tunnel, or tunnel container unless the user confirms the exact action twice in two separate messages.
- The first confirmation must approve the specific tunnel target and operation.
- After the first confirmation, restate the impact and ask for a second confirmation before running the command.
- If there is any doubt whether a command can interrupt tunnel access, treat it as tunnel-impacting and require the two confirmations.
- Accidental disconnection can lead to complete infrastructure lockout.
