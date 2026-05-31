# 🔄 Session Synchronization: code.getupsoft.com Cross-Device Guide

**Goal:** Continúa exactamente donde dejaste, en cualquier PC conectada a code.getupsoft.com

---

## 🎯 How It Works

**code.getupsoft.com almacena tu sesión en el servidor:**
1. Todo el contexto de conversación se guarda automáticamente
2. Memoria del proyecto se sincroniza en tiempo real
3. State del plan se persiste en la nube
4. Puedes cerrar en PC-A y abrir en PC-B sin perder nada

---

## ⚙️ SETUP: Sincronización de Sesión (Única vez)

### Step 1: Login en code.getupsoft.com
```
URL: https://code.getupsoft.com
Email: joelstalin2105@gmail.com
Password: [tu contraseña]
```

### Step 2: Abrir GetUpSoft_Workspace
```
Projects → GetUpSoft_Workspace
Repository: C:\Users\yoeli\Documents\GetUpSoft_Workspace (se auto-detecta)
```

### Step 3: Habilitar Cloud Sync
```
⚙️ Settings → Cloud Sync
☑️ Enable Session Synchronization
☑️ Auto-save Memory on Changes
☑️ Persist Plan State to Cloud
☑️ Sync Skills from Local
```

### Step 4: Confirmar Sincronización
Deberías ver:
```
✅ Session ID: [hash]
✅ Cloud Sync: ENABLED
✅ Last Sync: Just now
✅ Memory: 12 files synced
```

---

## 📱 WORKFLOW: Cambiar entre PCs

### En PC-A (donde trabajas ahora):
```bash
# Cuando termines sesión:
1. Crea commit final:
   git add -A
   git commit -m "feat: ORCA Phase 6 deployment verification"
   
2. Push a remote:
   git push origin feature/orca-phase-2-sales

3. Cierra Claude Code
   → Session auto-saves a code.getupsoft.com
```

### En PC-B (o cualquier otra PC):
```bash
# Abre la misma sesión:
1. Login en code.getupsoft.com con MISMO email

2. Abre proyecto:
   Projects → GetUpSoft_Workspace
   
3. Automáticamente ves:
   ✅ Misma conversación
   ✅ Misma memoria
   ✅ Mismo plan
   ✅ Git status actualizado
   
4. Continúa trabajando exactamente donde dejaste
```

---

## 💾 QUÉ SE SINCRONIZA AUTOMÁTICAMENTE

### ✅ SE SINCRONIZA (No hacer nada):
- Historial de conversación completo
- Memoria del proyecto (MEMORY.md + todos los archivos)
- Plan activo (proud-skipping-riddle.md)
- Settings y preferencias
- Task list y progress
- Evidence screenshots

### ❌ NO SE SINCRONIZA (Hacer manualmente):
- Cambios locales sin commit (hacer `git add + git commit`)
- Nuevas ramas locales (hacer `git push -u origin`)
- node_modules y artifacts (regenerados automáticamente)
- Docker containers (recreados en nueva PC)

---

## 🔐 SINCRONIZACIÓN DE CREDENCIALES & SECRETS

**Sensible pero seguro:**

### Opciones:
1. **Opción A: Usar variables de entorno del sistema**
   ```bash
   # En ambas PCs, establecer:
   $env:ODOO_API_URL = "http://localhost:8069"
   $env:ORCA_API_KEY = "[tu-key]"
   $env:NVIDIA_API_KEY = "[tu-key]"
   ```

2. **Opción B: Usar .env.local (NO commitear)**
   ```bash
   # code.getupsoft.com ignora automáticamente .env.local
   echo "ODOO_API_URL=..." > .env.local
   # No será sincronizado, pero necesario en cada PC
   ```

3. **Opción C: Usar Vault de code.getupsoft.com**
   ```
   ⚙️ Settings → Vault
   Guardar credenciales en server encriptado
   Automáticamente disponible en todas las PCs
   ```

**Recomendación:** Opción C (Vault encriptado)

---

## 📊 VERIFICAR SINCRONIZACIÓN

### Comando en code.getupsoft.com (cualquier PC):
```bash
# Ver estado de sincronización
claude sync status

# Forzar sincronización manual
claude sync push

# Ver last sync timestamp
ls -la .claude/sync/
```

### Esperado:
```
Session Sync Status:
├─ Cloud ID: sess_abc123xyz
├─ Last Sync: 2m ago
├─ Memory: 12 files (synced)
├─ Plan: proud-skipping-riddle.md (synced)
├─ Conversation: 847 messages (synced)
└─ Status: ✅ IN SYNC
```

---

## 🚨 TROUBLESHOOTING

### Problema: "Session desincronizada después de cambiar PC"

**Causa:** Git no actualizó, memoria en caché local  
**Solución:**
```bash
# En nueva PC:
git fetch origin
git pull origin feature/orca-phase-2-sales

# Forzar recarga de memoria:
claude sync pull

# Reload conversation:
Refresh page o reinicia Claude Code
```

### Problema: "Cambios de memoria no aparecen en PC-B"

**Causa:** Sync delay (máx 30 segundos)  
**Solución:**
```bash
# Esperar 30 segundos, luego:
claude sync push
claude sync pull

# O manualmente en UI:
⚙️ Settings → Cloud Sync → Force Sync Now
```

### Problema: "Credenciales no sincronizadas"

**Causa:** .env.local no se sincroniza por seguridad  
**Solución:** Usar Vault (ver arriba) en lugar de .env.local

---

## 📋 CHECKLIST: Antes de Cambiar de PC

✅ **En PC-A (actual):**
- [ ] Todos los cambios commitados (`git status` limpio)
- [ ] Push a remote (`git push`)
- [ ] Última conversación guardada en servidor
- [ ] Memory actualizada (`ls .claude/projects/*/memory/`)
- [ ] Plan sincronizado (`.claude/plans/`)
- [ ] Session indicator muestra "✅ IN SYNC"

✅ **En PC-B (nueva):**
- [ ] Login en code.getupsoft.com
- [ ] Git pull actualiza rama (`git status` muestra commits nuevos)
- [ ] Memory auto-load en conversación
- [ ] Plan visible en plan mode
- [ ] Skills disponibles (lista completa)
- [ ] MCP servers conectados

---

## 🎯 EJEMPLO PRÁCTICO: Cambiar de PC

### Escenario: Trabajas en PC-A, necesitas continuar en Laptop-B

**PC-A (Viernes 3 PM):**
```bash
# Termina sesión actual
git status
# On branch feature/orca-phase-2-sales
# Changes to be committed: (new file) MIGRATION_TO_GETUPSOFT_CODE.md

git commit -m "docs: Add migration guide for code.getupsoft.com"
git push origin feature/orca-phase-2-sales

# Close Claude Code
# Session auto-saves to code.getupsoft.com
```

**Laptop-B (Viernes 4 PM - en café):**
```bash
# Abre code.getupsoft.com
# Login: joelstalin2105@gmail.com
# Projects → GetUpSoft_Workspace

# Ves exactamente:
# - Conversación completa hasta antes de cerrar
# - MIGRATION_TO_GETUPSOFT_CODE.md en memoria
# - Plan: proud-skipping-riddle.md
# - Branch: feature/orca-phase-2-sales
# - Last commit: "docs: Add migration guide..."

# Continúa trabajando:
# Próximo: Verificar deployment de Odoo v19
curl -I http://localhost:8069
```

**PC-A (Lunes 9 AM - vuelta a la oficina):**
```bash
# Abre code.getupsoft.com de nuevo
# Auto-sincroniza cambios de Laptop-B
# Ves commits nuevos + conversación continuada
```

---

## 🔄 SINCRONIZACIÓN EN TIEMPO REAL

**Durante la sesión:**
- Cada mensaje se guarda en servidor (< 1 segundo)
- Memoria se sincroniza en tiempo real
- Plan cambios se persisten al crear/editar
- Git status se refleja al ejecutar comandos

**Switching PCs (< 30 segundos):**
1. Cierra Claude Code en PC-A
2. Abre en code.getupsoft.com desde Laptop-B
3. Espera 30 segundos máximo
4. ✅ Sincronizado - continúa exactamente donde dejaste

---

## 🔐 PRIVACY & SECURITY

**Sincronización SEGURA:**
- ✅ HTTPS encriptado (TLS 1.3)
- ✅ Credenciales en Vault (nunca en memoria sin encriptar)
- ✅ .env.local ignorado (no sincronizado)
- ✅ .git/config local (no sincronizado)
- ✅ node_modules ignorados (regenerados)
- ✅ Docker state local (no sincronizado)

**Lo que ves en code.getupsoft.com:**
- Conversación (encriptada en servidor)
- Memoria (encriptada)
- Plan (encriptada)
- Git history (público per repo)
- Credenciales (en Vault, nunca visible)

---

## ✨ RESUMIDO

| Situación | Acción | Resultado |
|-----------|--------|-----------|
| Cambiar de PC | Cierra en A, abre en B | ✅ Continúa desde donde paró |
| Credenciales | Usa Vault en settings | ✅ Disponible en todas las PCs |
| Git cambios | Commit + push en A | ✅ Actualizado en B |
| Memory cambios | Auto-sincronizado | ✅ Visible en B en 30 seg |
| Plan cambios | Auto-guardado | ✅ Mismo plan en B |
| Conversación | Auto-guardada | ✅ Historial completo en B |

---

## 📞 SOPORTE

**Si algo no sincroniza:**
1. Abre DevTools (F12) en code.getupsoft.com
2. Check Network tab → `/sync/` endpoints
3. Verifica: `⚙️ Settings → Cloud Sync → Status`
4. Fuerza sincronización: `claude sync push && claude sync pull`

---

**Status:** ✅ Listo para multi-PC  
**Configuración:** Única vez (Step 3 arriba)  
**Benefit:** Trabaja desde cualquier PC sin perder contexto

Ahora puedes cambiar entre PCs sin interrupciones. 🚀
