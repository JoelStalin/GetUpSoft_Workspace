# Plan de Instalación de OpenVPN Server en getupsoft-lan

Este documento detalla el plan paso a paso para la instalación y configuración de un servidor OpenVPN en el nodo central de la red interna de GetUpSoft (`getupsoft-lan`).

## 1. Información del Entorno
- **Host:** `getupsoft-lan`
- **IP Interna:** `192.168.1.233`
- **Usuario:** `ubuntu`
- **Sistema Operativo:** Ubuntu (basado en evidencias de despliegue previas)
- **Propósito:** Permitir acceso seguro a la infraestructura interna (Odoo, ORCA, LLM Servers) desde ubicaciones remotas.

## 2. Fase 1: Preparación del Servidor
Antes de la instalación, es necesario asegurar que el sistema esté actualizado y con las herramientas necesarias.

1. **Acceso SSH:** Verificar conectividad desde la estación de trabajo.
   ```bash
   ssh ubuntu@getupsoft-lan
   ```
2. **Actualización del Sistema:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. **Instalación de dependencias básicas:**
   ```bash
   sudo apt install -y curl tar git
   ```

## 3. Fase 2: Instalación de OpenVPN
Se propone utilizar el script de instalación mantenido por la comunidad para una configuración robusta y rápida, o realizar la instalación manual vía `apt`.

### Opción A: Script Automatizado (Recomendado para rapidez)
Utilizar el script de [Nyr/openvpn-install](https://github.com/Nyr/openvpn-install).
1. Descargar y ejecutar:
   ```bash
   wget https://git.io/vpn -O openvpn-install.sh
   chmod +x openvpn-install.sh
   sudo ./openvpn-install.sh
   ```
2. Parámetros recomendados durante la ejecución:
   - **Protocolo:** UDP (para mejor rendimiento).
   - **Puerto:** 1194 (por defecto).
   - **DNS:** 1.1.1.1 (Cloudflare) o 8.8.8.8 (Google).
   - **Nombre del Cliente:** `admin-getupsoft` (primer certificado).

### Opción B: Instalación Manual
1. Instalar el paquete:
   ```bash
   sudo apt install openvpn easy-rsa -y
   ```
2. Configurar la CA (Certificate Authority) usando Easy-RSA.

## 4. Fase 3: Configuración de Red y Seguridad
Para que la VPN funcione correctamente, el servidor debe permitir el tráfico entre interfaces.

1. **Habilitar IP Forwarding:**
   Editar `/etc/sysctl.conf` y descomentar:
   ```text
   net.ipv4.ip_forward=1
   ```
   Aplicar cambios: `sudo sysctl -p`.

2. **Configuración del Firewall (UFW):**
   ```bash
   sudo ufw allow 1194/udp
   sudo ufw allow OpenSSH
   # Configurar reglas de NAT si es necesario para salida a Internet vía VPN
   sudo ufw enable
   ```

## 5. Fase 4: Gestión de Clientes
1. **Generación de perfiles (.ovpn):** Los perfiles se guardarán en `/home/ubuntu/` por defecto con el script automatizado.
2. **Distribución segura:** Transferir los archivos `.ovpn` a los dispositivos clientes mediante canales seguros (SCP, ProtonDrive, etc.).

## 6. Fase 5: Validación y Pruebas
1. **Verificar estado del servicio:**
   ```bash
   sudo systemctl status openvpn-server@server
   ```
2. **Prueba de Conexión:** Conectar un cliente externo y verificar asignación de IP en el rango de la VPN (típicamente `10.8.0.x`).
3. **Prueba de Navegación Interna:** Verificar acceso a servicios en la LAN:
   - Ping a `192.168.1.233` (IP local del servidor).
   - Acceso a `http://192.168.1.233/orca`.

## 7. Mantenimiento y Logs
- **Logs del servidor:** `sudo tail -f /var/log/openvpn.log` o `journalctl -u openvpn-server@server`.
- **Revocación de certificados:** Usar el script `openvpn-install.sh` para gestionar usuarios existentes.

---
**Preparado por:** Gemini CLI
**Fecha:** 26 de mayo de 2026
