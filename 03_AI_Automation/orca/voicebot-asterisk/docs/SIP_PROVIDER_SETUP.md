# Configuración de Proveedores SIP

Esta guía proporciona plantillas genéricas para conectar el sistema a distintos proveedores de telefonía SIP usando el canal PJSIP de Asterisk 20.

**ADVERTENCIA**: Remplace siempre los *placeholders* por los datos reales de su cuenta.

## Plantilla Genérica PJSIP (Trunk)

Añada esto a su archivo `/etc/asterisk/pjsip.conf`:

```ini
[provider-trunk]
type=endpoint
transport=transport-udp
context=voicebot-from-trunk
disallow=all
allow=ulaw,alaw
outbound_auth=provider-auth
aors=provider-aor
from_user=OUTBOUND_CALLER_ID
from_domain=SIP_PROVIDER_HOST
direct_media=no
rtp_symmetric=yes
force_rport=yes
rewrite_contact=yes

[provider-auth]
type=auth
auth_type=userpass
username=SIP_USERNAME
password=SIP_PASSWORD

[provider-aor]
type=aor
contact=sip:SIP_PROVIDER_HOST

[provider-identify]
type=identify
endpoint=provider-trunk
match=SIP_PROVIDER_IP_OR_HOST
```

## Notas por Proveedor

### Twilio Elastic SIP
- Configure la IP de su servidor en el portal de Twilio (Access Control List).
- Utilice SIP de origen y destino configurados en Twilio.
- Asegúrese de que el contexto coincida con la ruta entrante.

### VoIP.ms
- Habilite "IP Authentication" si es posible, o use autenticación por usuario/contraseña.
- `SIP_PROVIDER_HOST` suele ser algo como `dallas1.voip.ms`.
- Asegúrese de permitir los códecs correctos (ulaw es preferible para IVRs e IA).

### Telnyx / Flowroute
- Ambos permiten el control estricto por IP. Puede usar `match=IP_DEL_PROVEEDOR` en el bloque de identificación PJSIP para enrutamiento seguro sin registro periódico.

*Asegúrese siempre de recargar PJSIP después de hacer cambios (`asterisk -rx "pjsip reload"`).*
