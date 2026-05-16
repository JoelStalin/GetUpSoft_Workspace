# Matriz de Casos de Uso: Operación Industrial Galante's Jewelry

Este documento define el comportamiento automatizado del bot ante los diferentes escenarios detectados en Instagram, garantizando que la cuenta `@galantesjewelrybythesea` mantenga su prestigio y salud operativa.

| Caso de Uso | Estado Visual | Acción del Bot | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **Cuenta Pública Relevante** | Botón 'Follow' y 'Message' visibles. | Seguir + Enviar Invitación. | Éxito total: Mensaje en chat. |
| **Cuenta Privada (Sin Seguir)** | Botón 'Follow' visible, 'Message' ausente. | Clic en 'Follow' (Solicitud). | **OMITIR MENSAJE** (Registrar como Proseguido). |
| **DMs Restringidos / Cerrados** | Botón 'Message' abre un chat bloqueado. | Detección de falta de TextBox. | **OMITIR ENVÍO** (Evitar bloqueo por SPAM). |
| **Usuario ya Seguido** | Botón dice 'Following' o 'Siguiendo'. | Omitir Clic Seguimiento. | Proceder directamente al DM. |
| **Límite de Frecuencia (Rate Limit)** | Modal de error 'Try again later'. | Detección de popup bloqueante. | **PAUSA DE SEGURIDAD** (60 min). |
| **URL de Sistema / Invalida** | Enlaces como /explore, /reels, etc. | Filtrado Nuclear en Scraping. | Omitir objetivo automáticamente. |
| **Perfil con E2EE (Cifrado)** | Mensaje enviado pero no sincronizado en Celular. | Verificación visual en Browser. | Mensaje enviado (Visible en modo Auditoría). |

## Protocolo de Manejo de Errores Críticos

1.  **Fallo de Envío Físico:** Si el botón 'Send' no es detectable tras 3 intentos, el bot utiliza la ráfaga de 'ENTER' como método de fuerza bruta industrial.
2.  **Shadow-ban Preventivo:** Si se detectan 3 fallos consecutivos en cuentas públicas, el bot entra en modo "Sleep" por 2 horas para proteger la reputación de Daniello.
3.  **Transición Fallida:** Si no se puede abrir el chat, el bot registra el 'Follow' pero marca el mensaje como 'SKIPPED' en el log, permitiendo que la campaña continúe con el siguiente cliente sin detenerse.

---
*Este protocolo asegura que Galante's Jewelry pueda prospectar a sus 1,641 seguidores de forma continua y visible sin riesgo de bloqueos permanentes.*
