# Deployment

## Objetivo

Exponer ORCA como servicio HTTP local y dejarlo desplegado de forma reproducible en `ssh.getupsoft.com.do`.

## Superficie operativa

- `GET /health`: valida disponibilidad, lenguaje canónico y política de ejecución.
- `POST /interpret`: interpreta `text`, `script` o `audio`.
- `POST /n8n-payload`: devuelve el contrato listo para orquestación futura.

## Arranque local

```powershell
uvicorn --factory orca.service.app:create_app --host 127.0.0.1 --port 8787
```

## Despliegue remoto

```powershell
./scripts/deploy_orca_service.ps1
```

El script:

1. empaqueta el `HEAD` actual;
2. sube el artefacto por `scp`;
3. instala una release en `/opt/getupsoft-orca`;
4. crea o actualiza `getupsoft-orca.service`;
5. reinicia `systemd`;
6. valida `http://127.0.0.1:8787/health` en el servidor.

## Unidad systemd

- nombre: `getupsoft-orca.service`
- usuario: `ubuntu`
- workdir: `/opt/getupsoft-orca/current`
- puerto por defecto: `8787`

## Notas operativas

- el despliegue es in-place con releases timestamped y symlink `current`;
- el puerto se mantiene en loopback para integrarlo después con proxy inverso;
- el servicio no depende de LLMs remotos para interpretar prompts.
