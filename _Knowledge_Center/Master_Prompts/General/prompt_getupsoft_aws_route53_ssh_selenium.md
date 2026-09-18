# Prompt maestro — Implementación, DNS en AWS (Route 53), Deploy por SSH, GitHub CLI y Testing con Selenium

Copia y pega este prompt en ChatGPT (u otra IA) para que te genere **guía + comandos + scripts** completos para implementar y probar tu proyecto usando:

- **AWS solo para enrutamiento DNS (Route 53)**  
- **AWS CLI** para configuración dinámica e idempotente  
- **Deploy remoto por SSH**  
- **GitHub CLI (`gh`)** para autenticación/operaciones  
- **Testing local E2E con Selenium**  

---

## Prompt (listo para usar)

Actúa como **DevOps Engineer + QA Automation Engineer**. Necesito que me entregues una guía y artefactos técnicos **ejecutables** para implementar y probar un proyecto con el siguiente enfoque:

### 1) Restricciones y alcance
- **AWS se usará únicamente para enrutar el dominio** (DNS en Route 53 y lo estrictamente necesario para apuntar/alias/validaciones).  
  - No uses AWS para hosting si no es estrictamente requerido.
- Trabajo en **Windows**. Preferir:
  - Scripts en **PowerShell** o **Bash compatible con WSL**.
- Todo debe hacerse con **AWS CLI** (evitar consola web, salvo que sea inevitable).
- La configuración debe ser **dinámica**, basada en variables por entorno (`dev/stage/prod`) y parámetros reutilizables:  
  `AWS_PROFILE`, `AWS_REGION`, `ZONE_NAME`, `RECORDS`, `TTL`, `TARGET` (IP o CNAME), etc.
- Debo ejecutar pruebas **E2E locales con Selenium** (Python recomendado).
- Debo conectarme por **SSH** para despliegues remotos.
- Debo usar **GitHub CLI** (`gh`) cuando aplique.
- **Regla de credenciales (obligatoria):**  
  Si alguna herramienta requiere credenciales/secretos (AWS, GitHub, SSH, users de prueba, etc.), **detente y pídemelas**.  
  No inventes valores. Indica exactamente el **formato** esperado.

---

### 2) Entregables que debes producir (en este orden)

#### A) Checklist de pre-requisitos (local y remoto)
- Qué instalar: AWS CLI, GitHub CLI, OpenSSH, Python, Selenium, drivers (ChromeDriver/GeckoDriver), etc.
- Cómo validar versiones y accesos (comandos exactos).

#### B) Diseño mínimo viable de enrutamiento de dominio con Route 53
- Dame la opción más simple entre:
  1) Route 53 apuntando **A** (IP) o **CNAME** a un endpoint existente,
  2) Route 53 + CloudFront solo si necesito HTTPS y no tengo LB,
  3) Route 53 + ALB si ya existe infraestructura,
  4) Redirección (si aplica).
- Explica pros/contras brevemente.
- Elige una ruta **default** para mi caso.

#### C) Implementación con AWS CLI (scripts idempotentes)
Quiero un script (Bash o PowerShell) parametrizable que:
- Detecte automáticamente el **Hosted Zone ID** con `aws route53 list-hosted-zones-by-name`.
- Cree/actualice records en Route 53 (UPSERT) de forma **idempotente**.
- Soporte **múltiples records** y **wildcards**.
- Loguee en un archivo local.
- Imprima comandos de diagnóstico (dig/nslookup).

**Caso de ejemplo (del que debes partir):**
- Hosted Zone: `getupsoft.com.do.`
- Record A:
  - `isp.getupsoft.com.do.` -> `192.0.0.23` (TTL 300)
- y/o wildcards:
  - `*.isp.getupsoft.com.do.` -> misma IP (si aplica)
- También necesito el equivalente para:
  - `net.getupsoft.com.do.` y `*.net.getupsoft.com.do.` (si decido usarlos)

> Si mi IP es dinámica, el script debe detectar la IP pública (ej: `checkip.amazonaws.com`).  
> Si la IP es fija, el script debe aceptar `TARGET_IP` como entrada.

#### D) Despliegue remoto por SSH (script)
- Script para:
  - Conectarse por SSH (preferible key-based).
  - Actualizar código (git pull o descargar release).
  - Instalar dependencias mínimas.
  - Reiniciar servicio (systemd o docker compose, según convenga).
  - Health check (curl).
- Manejo de errores: `set -euo pipefail` (en bash) o equivalente en PowerShell.
- Logs claros.

#### E) Flujo GitHub CLI (`gh`)
- Comandos para:
  - `gh auth login`
  - clonar repo
  - crear secrets (si aplica)
  - correr pipeline manual (si aplica)
  - tag/release (si aplica)

#### F) Testing local con Selenium
- Proyecto en Python con:
  - `pytest`
  - (opcional) `pytest-html`
  - parametrización por entorno con `BASE_URL`
- Incluye ejemplos de:
  - setup driver
  - navegación
  - screenshots en falla
  - reporte
- Buenas prácticas mínimas (timeouts explícitos, waits, estructura pages).

#### G) Pipeline recomendado (opcional pero ideal)
- Propuesta de GitHub Actions para:
  - lint
  - unit tests
  - E2E opcional
  - deploy por SSH con aprobación manual

---

### 3) Preguntas mínimas que debes hacerme antes de generar comandos finales
Antes de escribir scripts definitivos, hazme **solo** estas preguntas indispensables:

1) ¿Cuál es el **dominio base** y la **Hosted Zone** exacta en Route 53? (ej. `getupsoft.com.do.`)  
2) ¿Qué records debo mantener? (ej. `isp.getupsoft.com.do`, `net.getupsoft.com.do`, wildcards sí/no)  
3) ¿El destino es **IP fija** o **IP dinámica**?  
4) ¿Cómo es el servidor remoto para deploy? (OS, Docker/systemd, puerto, usuario)  
5) ¿Repo GitHub (owner/repo) y si usa Actions?

**Regla:** cada vez que detectes que necesitas un secreto/credencial, detente y pídemelo:
- AWS (SSO o access keys)
- `gh` token o login
- SSH key / passphrase
- credenciales de usuario de prueba para Selenium (si aplica)

---

## Resultado esperado
Empieza entregando:
1) Checklist A  
2) Recomendación B (default)  
3) Scripts C y D completos  
4) Comandos de GitHub CLI E  
5) Proyecto Selenium F con ejemplos  
6) (Opcional) GitHub Actions G

Todo debe ser reproducible, con comandos exactos, y con variables claramente documentadas.
