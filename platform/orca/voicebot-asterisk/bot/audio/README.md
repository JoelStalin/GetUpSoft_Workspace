# Archivos de Audio

Este directorio está destinado a almacenar audios estáticos o dinámicos generados por un motor TTS (Text-to-Speech).

En la primera fase del MVP, el bot utiliza `sound:hello-world`, el cual es un archivo de audio preinstalado en Asterisk (`/var/lib/asterisk/sounds/`). 

Para usar audios personalizados a través de ARI, colóquelos aquí y asegúrese de que el usuario `asterisk` tenga permisos de lectura, o guárdelos directamente en `/var/lib/asterisk/sounds/es/`.
