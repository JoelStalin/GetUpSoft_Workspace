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
