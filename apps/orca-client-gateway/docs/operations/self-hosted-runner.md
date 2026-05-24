# Self-Hosted Runner (ORCA QA)

## Objetivo

Habilitar el job `remote-log-validation` del workflow `orca-gateway-qa` en infraestructura GetUpSoft.

## Runner esperado

- Nombre sugerido: `getupsoft-lan-runner`
- Labels:
  - `self-hosted`
  - `getupsoft-lan`
- Servicio systemd:
  - `actions.runner.JoelStalin-GetUpSoft_Workspace.getupsoft-lan-runner.service`

## Secrets requeridos

- `SUDO_PASSWORD` (password sudo del usuario del runner)

## Comandos de estado (servidor runner)

```bash
sudo systemctl status actions.runner.JoelStalin-GetUpSoft_Workspace.getupsoft-lan-runner.service
```

```bash
sudo journalctl -u actions.runner.JoelStalin-GetUpSoft_Workspace.getupsoft-lan-runner.service -n 100 --no-pager
```

## Ejecución del workflow

Inputs recomendados:

- `base_url`: endpoint ORCA Gateway objetivo
- `validate_logs`: `true`
- `remote_runner_label`: `getupsoft-lan`

## Verificación de resultado

El run pasa cuando:

1. `vertical-flow-qa` termina `success`
2. `remote-log-validation` termina `success`
3. Artifact `orca-gateway-qa-evidence` queda publicado

