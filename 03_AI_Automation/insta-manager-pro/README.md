# Insta Manager Pro 🚀

Plataforma unificada de gestión inteligente para Instagram. Combina una interfaz web moderna para gestión de contenido con motores de automatización potentes (Follow/Unfollow/DMs).

## Arquitectura del Proyecto

Este proyecto es una fusión de dos herramientas de alto rendimiento:
1.  **Frontend & Backend (Node.js/React):** Gestiona la interfaz de usuario, programación de contenido e inteligencia artificial para la generación de posts.
2.  **Automation Engines (Python):** Motores especializados en automatización directa (Scraping, Seguimiento, Mensajería masiva) ubicados en el directorio `/engines`.

## Estructura de Directorios

-   `/client`: Frontend en React + Vite.
-   `/server`: Backend en Express + tRPC.
-   `/shared`: Código compartido (tipos, esquemas).
-   `/drizzle`: Migraciones y esquemas de base de datos (MySQL).
-   `/engines`: Motores de automatización en Python (anteriormente `insta-unfollow-bot-controlado`).
-   `/engines/bot`: Lógica core de los bots.

## Requisitos

-   Node.js v20+
-   Python 3.10+
-   MySQL (para la persistencia de datos del portal)
-   Chrome/Chromium (para los motores de Selenium/Playwright)

## Instalación

1.  **Instalar dependencias del portal:**
    ```bash
    pnpm install
    ```
2.  **Instalar dependencias de los motores:**
    ```bash
    cd engines
    pip install -r requirements.txt
    ```
3.  **Configurar entorno:**
    ```bash
    cp .env.example .env
    ```

## Funcionalidades Integradas

-   **AI Content Generation:** Generación automática de contenido para posts.
-   **Follow/Unfollow Controlado:** Algoritmos inteligentes para evitar bloqueos.
-   **DM Automation:** Envío masivo y controlado de mensajes directos.
-   **Dashboard Operativo:** Visualización de métricas y control de bots.

## Analisis Estrategico de Instagram

-   El proyecto incluye reglas locales en `AGENTS.md` para sesiones de analisis estrategico de Instagram.
-   La plantilla versionada del prompt maestro vive en `shared/prompts/instagramStrategicAnalysis.ts`.
-   Esta plantilla esta pensada para usarse en `Claude Cowork + Windsor AI` y no altera el comportamiento actual del producto por defecto.

---
*Parte del ecosistema GetUpSoft / Orca.*
