# ORCA Client Desktop (MVP)

Cliente desktop local para pruebas del flujo:

- pairing
- enroll
- heartbeat
- command poll
- command result

## Ejecutar en desarrollo

```bash
npm install
npm run start
```

## Build Windows local (sin instalador)

```bash
npm run build:win:packager
```

Salida:

`dist-packager/GetUpSoft-Orca-Agent-win32-x64/GetUpSoft-Orca-Agent.exe`

## Build con electron-builder

```bash
npm run build:win:dir
npm run build:win:portable
```

Nota:

En algunos entornos Windows puede fallar por permisos de symlink en el cache de `winCodeSign`.
Usar `build:win:packager` como fallback operativo local.

## Build Linux (packager)

```bash
npm run build:linux:packager
```

Salida:

`dist-packager/GetUpSoft-Orca-Agent-linux-x64/`
