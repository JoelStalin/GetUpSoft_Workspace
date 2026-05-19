# Guía de Seguridad para Voicebot

El despliegue de sistemas de telefonía como Asterisk en la nube pública es altamente susceptible a ataques de fuerza bruta, escaneo SIP, y fraude de llamadas.

Siga estas reglas de manera obligatoria:

## 1. Protección de la Interfaz ARI
- **NO exponga el puerto 8088 a Internet.** La configuración de `http.conf` debe ser `bindaddr = 127.0.0.1`.
- Si el bot de Python se ejecuta en un servidor distinto, utilice una **VPN** (WireGuard/OpenVPN) o un proxy inverso estricto (NGINX/Caddy) con TLS y autenticación.
- Use contraseñas generadas criptográficamente para los usuarios de `ari.conf`.

## 2. Protección SIP / PJSIP
- Utilice `ufw` o `iptables` para permitir tráfico en el puerto 5060/UDP **solamente** desde las IPs de su proveedor SIP y de sus oficinas. Evite `0.0.0.0/0` en producción.
- Utilice `fail2ban` configurado para leer los logs de Asterisk y bloquear automáticamente IPs con intentos fallidos de registro SIP.
- Nunca utilice contraseñas débiles como "1234" o iguales a la extensión ("1001").

## 3. Prevención de Fraude de Llamadas
- El contexto `voicebot-internal` o el contexto del trunk **no debe tener** rutas de salida irrestrictas (`_X.`). Solo debe enrutar hacia la aplicación Stasis.
- Bloquee llamadas internacionales a nivel de proveedor si no son necesarias.

## 4. Auditoría y Logs
- Evite guardar contraseñas o números de tarjetas de crédito en logs de texto plano.
- Configure la rotación de logs de Asterisk en `/etc/logrotate.d/asterisk`.
