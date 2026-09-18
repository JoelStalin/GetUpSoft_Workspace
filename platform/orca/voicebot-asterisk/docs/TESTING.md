# Pruebas Paso a Paso (Testing)

Siga este procedimiento para verificar que el MVP está funcionando correctamente.

## Prueba 1: Verificar el Servicio Asterisk
```bash
sudo systemctl status asterisk
```
Debería indicar que está `active (running)`.

## Prueba 2: Verificar la Interfaz ARI local
Reemplace la contraseña por la que configuró en la Fase 4:
```bash
curl -u voicebot:CONTRASEÑA http://127.0.0.1:8088/ari/asterisk/info
```
Debe retornar un JSON con la información del sistema Asterisk.

## Prueba 3: Iniciar el Bot Manualmente
Abra una segunda terminal y ejecute el bot:
```bash
cd /opt/voicebot-asterisk/bot
source venv/bin/activate
python bot.py
```
Debería ver mensajes en la consola indicando que se conectó a Asterisk ARI y está escuchando.

## Prueba 4: Configuración de Softphone y Llamada
1. Ejecute `sudo ./scripts/configure_pjsip_demo.sh` para crear la extensión 1001 si no lo ha hecho.
2. Descargue un softphone como MicroSIP, Zoiper o Linphone.
3. Configure la cuenta:
   - **Dominio/Servidor:** IP pública de su servidor Ubuntu.
   - **Usuario:** 1001
   - **Contraseña:** La que haya configurado en el script.
   - **Transporte:** UDP.
4. En el softphone, marque al número `1000`.
5. **Resultado esperado:**
   - La llamada entra.
   - El bot en la terminal de Python detecta el evento `StasisStart`.
   - El bot contesta y manda a reproducir un audio (`hello-world`).
   - El softphone reproduce "Hello world" o similar.
   - Se corta la llamada y el bot detecta el `PlaybackFinished` y `StasisEnd`.

## Prueba 5: Logs en Producción
Si el servicio está ejecutándose mediante `systemd`:
```bash
sudo journalctl -u voicebot-ari -f
```
