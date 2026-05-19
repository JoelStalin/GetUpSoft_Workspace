# 🚀 EJECUTA ESTO AHORA EN code.getupsoft.com

## Pasos a seguir:

### 1️⃣ Abre terminal en code.getupsoft.com

Ctrl+` (backtick) o Terminal > New Terminal

### 2️⃣ Copia y ejecuta este comando COMPLETO:

```bash
cd /home/ubuntu/GetUpSoft_Workspace && chmod +x scripts/deploy-from-code-server.sh && ./scripts/deploy-from-code-server.sh
```

### 3️⃣ El script hará automáticamente:

✅ Validar Docker  
✅ Cargar credenciales Cloudflare  
✅ Validar Git  
✅ Rebuild imagen Docker  
✅ Desplegar contenedor  
✅ Validar respuesta  
✅ Purgar caché  
✅ Mostrar reporte  

### 4️⃣ Después del deployment:

Abre en navegador:
- https://getupsoft.com (haz hard refresh: **Ctrl+Shift+R**)
- https://getupsoft.com.do (haz hard refresh: **Ctrl+Shift+R**)

---

## Si algo falla:

```bash
# Ver logs
docker logs -f getupsoft-site-web-1

# Ver reporte
cat /tmp/deployment-report.txt

# Verificar credentials
source .env.cloudflare && echo "Zone: $CLOUDFLARE_ZONE_ID"
```

---

## ¿Listo? Ejecuta el comando completo de arriba en code.getupsoft.com terminal 👆
