# Orca Voicebot | Asterisk 20 & Python ARI

Este proyecto contiene la infraestructura de telefonía de **Orca**, el orquestador de IA de **Getupsoft**. Utiliza **Asterisk 20 LTS** y la interfaz **ARI** para automatizar interacciones de voz.

## Integración con el Ecosistema Getupsoft
Este módulo se conecta con el "Cerebro" de Orca (`src/agents/mark-xxxix`) para procesar llamadas entrantes mediante agentes autónomos.

Lee `docs/ARCHITECTURE.md` para más detalles.

## Requisitos
- Ubuntu 22.04 LTS (recomendado).
- Acceso a `root`.

## Instalación Rápida
Ejecuta los scripts en el siguiente orden desde el servidor destino:

1. `sudo ./scripts/install_dependencies.sh`
2. `sudo ./scripts/install_asterisk_20.sh`
3. `sudo ./scripts/configure_ari.sh`
4. `sudo ./scripts/firewall_basic.sh`

## Configuración del Bot
```bash
cd /opt/voicebot-asterisk/bot
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
nano .env  # Configura tus credenciales ARI
```

## Ejecución del Bot
**Modo manual (para pruebas):**
```bash
python bot.py
```

**Modo Servicio (producción):**
```bash
sudo cp /opt/voicebot-asterisk/systemd/voicebot-ari.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable voicebot-ari
sudo systemctl start voicebot-ari
```

## Pruebas (Softphone)
Ejecuta `sudo ./scripts/configure_pjsip_demo.sh` para crear la extensión 1001.
Revisa la documentación en `docs/TESTING.md`.

## Conexión a un Troncal SIP Real
Revisa la guía en `docs/SIP_PROVIDER_SETUP.md`.
