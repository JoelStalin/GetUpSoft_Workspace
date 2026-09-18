# Infrastructure Boundaries

## GetUpSoft vs client infrastructure

- `galantesjewelry` / Galantes Jewelry is a client product developed by GetUpSoft.
- Galantes Jewelry runs in a separate client environment.
- Galantes Jewelry infrastructure must not be used as a fallback, production target, tunnel host, workspace sync target, or deployment environment for GetUpSoft itself.

## GetUpSoft targets

- Use GetUpSoft-owned access targets for GetUpSoft work:
  - `getupsoft-lan`
  - `ssh.getupsoft.com.do`
- If both targets are unavailable, stop and report the access/tunnel blocker instead of using a client environment.

## Tunnel safety

- Do not stop, remove, restart, replace, recreate, disable, or reroute any tunnel unless the user confirms the exact action twice in two separate messages.
- This applies to Cloudflare tunnels, SSH tunnels, reverse proxy tunnels, and tunnel containers.
- The first confirmation authorizes the exact target and operation.
- The second confirmation must happen after the agent restates the access impact and asks again.
- When unsure whether a command can affect tunnel access, treat it as tunnel-impacting and require double confirmation.
