# Orca Meta OAuth: proxy real, bloqueos y soluciones

## Arquitectura final

```text
Facebook OAuth
    |
    v
https://getupsoft.com/api/auth/meta/*
    |
    v
Cloudflare Access/SSH + origen autorizado
    |
    v
Nginx del sitio :5173
    |  /api/auth/meta/ -> host.docker.internal:8788
    v
NestJS Orca :8788
    |
    v
Meta Graph OAuth
```

El subdominio estable `https://orca.getupsoft.com` continúa apuntando directamente al backend Orca. El dominio principal usa el proxy para que Meta vea y acepte el callback de `getupsoft.com`.

## Bloqueos encontrados y solución

1. **Dominio no incluido en Meta**  
   App Domains y Website Site URL deben incluir los dominios usados. Además, Facebook Login requiere registrar la URI completa en **Valid OAuth Redirect URIs**:
   `https://getupsoft.com/api/auth/meta/callback` y `https://orca.getupsoft.com/api/auth/meta/callback`.

2. **El dominio raíz devolvía la SPA**  
   `getupsoft.com/api/auth/meta/start` y `callback` devolvían `index.html`. Nginx ahora reserva `/api/auth/meta/` y lo reenvía a NestJS.

3. **Diferencia entre Docker Desktop y Linux**  
   Se añadió `host.docker.internal:host-gateway` en Compose y `--add-host host.docker.internal:host-gateway` en el workflow.

4. **Puerto inconsistente**  
   Nginx escucha en `5173`; Compose se corrigió de `3120:80` a `3120:5173`.

5. **MCP de Meta sin Bearer**  
   El endpoint MCP responde `401 Authentication Required`. El Client Token de la app no es un OAuth Bearer del MCP y no debe usarse como `client_secret`. El token debe emitirse mediante el OAuth oficial de Meta.

6. **Origen público no sincronizado**  
   El checkout local tenía el proxy, pero el repositorio remoto no. Se creó la rama `codex/meta-oauth-proxy` y el PR #14 con los cambios.

## Pruebas realizadas

- Backend NestJS: typecheck, build y Jest: 23 pruebas aprobadas.
- Imagen Docker del sitio: build aprobado.
- Site CI: lint/typecheck, build, Docker y Kubernetes aprobados.
- `https://orca.getupsoft.com/api/auth/meta/start`: HTTP 200 JSON.
- Callback Orca generado correctamente:
  `https://orca.getupsoft.com/api/auth/meta/callback`.
- Verificación remota de la rama: Nginx proxy, puerto 5173 y host-gateway presentes.

## Activación controlada

1. Revisar y fusionar PR #14.
2. Ejecutar GitHub Actions con el entorno de producción.
3. Confirmar que el backend NestJS escucha en `127.0.0.1:8788`.
4. Ejecutar:

```powershell
./apps/site/scripts/verify-meta-proxy.ps1 `
  -BaseUrl https://getupsoft.com `
  -ExpectedCallbackHost getupsoft.com
```

La respuesta debe ser HTTP 200 JSON y contener:

```text
https://getupsoft.com/api/auth/meta/callback
```

5. Probar el flujo OAuth desde Chrome autenticado y revisar consola, payload y red.
6. Confirmar webhook y firma HMAC; las pruebas inválidas deben devolver HTTP 401.

## Estado

El proxy está implementado en la rama `codex/meta-oauth-proxy`, con PR #14 listo para revisión. No se fusiona ni se ejecuta producción automáticamente para preservar rollback y aprobación del entorno productivo.
