# ORCA v19 Lab Setup - Quick Reference Card

**One-page guide. Print this. Keep handy.**

---

## 🚀 START LAB IN ONE COMMAND

### Windows PowerShell
```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace
.\scripts\automated_lab_setup.ps1
```

### Linux/macOS
```bash
cd /path/to/GetUpSoft_Workspace
chmod +x scripts/automated_lab_setup.sh
./scripts/automated_lab_setup.sh
```

**Wait 5-8 minutes (first run) or 2-3 minutes (restarts)**

---

## 🌐 ACCESS LAB

**URL:** http://localhost:8069  
**Login:** admin  
**Password:** admin

---

## ✅ VERIFY INSTALLATION

1. Open http://localhost:8069 → Login
2. Go to **Accounting** → **ORCA Logs**
3. See log entries? ✅ **Lab is ready!**

---

## 📚 WHAT'S INSTALLED

**PostgreSQL 15** → Database (odoo19_orca)  
**Odoo 19.0** → Application server  
**13 Modules** → ORCA audit logging

```
base_orca_integration (foundation)
account_extended, pos_extended, sale_extended
asset_extended, stock_extended, payment_extended
bank_extended, invoice_extended
l10n_do_accounting, l10n_do_accounting_report
l10n_do_pos, l10n_do_rnc_search
```

---

## 🛠️ USEFUL COMMANDS

```bash
# View logs in real-time
docker-compose logs -f odoo

# Access Odoo shell
docker-compose exec odoo bash

# Restart services
docker-compose restart

# Stop lab (keep data)
docker-compose stop

# Restart lab
docker-compose up -d

# Complete cleanup (DELETE DATABASE!)
docker-compose down -v
```

---

## ⚠️ COMMON ISSUES

| Problem | Solution |
|---------|----------|
| **Docker not running** | Open Docker Desktop, wait 2 min, re-run script |
| **Port 8069 in use** | Edit docker-compose.yml line 38: change to `"8070:8069"` |
| **PostgreSQL fails** | Run `docker-compose down -v`, then re-run script |
| **Odoo shows 502** | Wait 2-3 minutes, check: `docker-compose logs odoo` |
| **PowerShell won't run** | Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -CurrentUser` |

---

## 📖 NEXT STEPS

1. **Lab Running?** → Verify ORCA logs visible ✅
2. **Ready for Code?** → Open `PHASE1_QUICK_START_CHECKLIST.md`
3. **Need Help?** → See `LAB_AUTOMATION_GUIDE.md` (troubleshooting)

---

## 📊 LAB STATUS AT A GLANCE

```
Docker Containers:
  ✅ odoo19_postgres  (PostgreSQL 15)
  ✅ odoo19_orca      (Odoo 19.0)

Services:
  ✅ Database: odoo19_orca (odoo/odoo)
  ✅ Application: http://localhost:8069

Modules Installed: 13
  ✅ All auto-installed during setup

Data Persistence:
  ✅ Database data: postgres_data volume
  ✅ Odoo data: odoo_data volume
  ✅ Survives restart (unless docker-compose down -v)
```

---

## 🔒 SECURITY NOTE

⚠️ This lab is for **TESTING ONLY**
- Default admin password: `admin`
- No HTTPS enabled
- Not exposed to network (localhost only)
- Never use production credentials or data

---

## 💾 BACKUP YOUR DATA

```bash
# Before cleanup, backup database
docker-compose exec postgres pg_dump -U odoo odoo19_orca > backup.sql

# Restore from backup
docker-compose down -v
docker-compose up -d
docker-compose exec postgres psql -U odoo odoo19_orca < backup.sql
```

---

## 📱 QUICK SUPPORT

**Script hangs?** — Press Ctrl+C, check `docker-compose logs`  
**Need fresh start?** — `docker-compose down -v` then re-run script  
**Questions?** — See `LAB_AUTOMATION_GUIDE.md` or `AUTOMATED_LAB_INFRASTRUCTURE.md`

---

## ⏱️ TIMELINE

| Action | Time |
|--------|------|
| Script start | 0 min |
| Docker startup | 1-2 min |
| PostgreSQL healthy | 2-3 min |
| Odoo ready | 3-5 min |
| Modules installed | 4-6 min |
| Tests (optional) | 5-8 min |
| **Lab ready** | **5-8 min** |

---

**Quick Card Version:** 1.0  
**Date:** 2026-05-28  
**Status:** ✅ Ready

Print this page. Keep it handy while setting up the lab.
