# Workspace CLI Access

Documentacion operativa del bundle de CLI instalado en `ssh.getupsoft.com.do`.

## Scope

Los CLI de este bundle solo funcionan dentro de:

- `/home/ubuntu/workspaces/GetUpSoft_Workspace`
- `/home/ubuntu/workspaces/flai_Workspace`

Fuera de esas rutas, los wrappers bloquean la ejecucion.

## Install location

- Bundle root: `~/.workspace-cli/flai-getupsoft`
- Wrappers: `~/.workspace-cli/flai-getupsoft/bin`
- Profiles: `~/.workspace-cli/flai-getupsoft/profiles`
- Auto-PATH hook: `~/.bashrc`

## Available commands

| CLI | Command | Status | Account / Auth |
|---|---|---|---|
| Google Cloud | `gcloud` | working | `ceo@galantesjewelry.com` |
| GitHub CLI | `gh` | working | `JoelStalin` |
| OpenAI Codex | `codex` | working | logged in with ChatGPT |
| Gemini | `gemini` | working | `joelstalin2105@gmail.com` |
| Claude Code | `claude` | working | credentials loaded and verified |
| GitHub Copilot CLI | `copilot` | working | reuses `gh` auth |
| Node.js | `node` | working | `v24.14.0` |
| npm | `npm` | working | `11.9.0` |
| pnpm | `pnpm` | working | `10.33.2` |
| uv | `uv` | working | `0.11.7` |
| OpenAI Python CLI | `openai` | installed | binary available |
| ripgrep | `rg` | working | bundled |

## Quick use

```bash
cd /home/ubuntu/workspaces/GetUpSoft_Workspace
workspace-cli-status
workspace-cli-login-help
```

## Validation commands

```bash
cd /home/ubuntu/workspaces/GetUpSoft_Workspace
gcloud auth list
gh auth status
codex login status
gemini -p "reply only OK"
claude -p "reply only OK"
copilot --help
```

## Notes

- `Gemini` was verified with `joelstalin2105@gmail.com`.
- `Claude Code` was verified with a live prompt response.
- `Copilot CLI` depends on `gh` authentication.
- `gcloud` is authenticated and currently points to project `deft-haven-493016-m4`.
- This setup is intentionally isolated so other environments and users on the same server can keep separate CLI access.
