// Conexion al navegador de WhatsApp Web, con dos modos explicitos y deliberadamente
// separados. No hay un tercer modo implicito: quien llama elige uno de los dos.
//
//   LOGIN  -> headless:false, ventana visible. Solo para que el usuario escanee el QR una
//             vez (scripts/careerai_whatsapp_login_handoff.mjs). Se usa una sola vez por
//             sesion; despues la sesion queda persistida en el perfil.
//   ENVIO  -> headless:true (o 'new'), sin ventana. Reutiliza el mismo perfil ya logueado.
//             Es el modo de produccion: enviar una notificacion no debe abrir una ventana
//             visible cada vez.
//
// WHATSAPP_WEB_FORCE_VISIBLE=1 fuerza ventana visible incluso en modo envio, para depurar
// sin tener que cambiar codigo.
import path from 'node:path';
import { chromium } from '../../workflow-editor/node_modules/playwright/index.mjs';

const CHROME_ARGS = ['--start-maximized', '--disable-blink-features=AutomationControlled'];
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// Diagnosticado 2026-08-28 (scripts/diagnose_whatsapp_web_search.mjs, con sondeo real de 20s
// y chequeo de document.visibilityState/hidden — no era eso, ambos reportaban "visible"):
// headless:true puro se queda atascado en el splash indefinidamente, igual que el bug del QR
// pero esta vez sin fix de UA/viewport/anti-deteccion que lo resuelva — WhatsApp Web detecta
// el modo headless real de Chrome por otra via (fingerprinting de renderer/plugins) y no
// termina de montar la app. Fix que si funciona: ventana headed (headless:false) posicionada
// fuera de pantalla — Chrome renderiza todo como si fuera una ventana real y visible (porque
// lo es, solo que no aparece donde el usuario pueda verla), sin el fingerprint de headless.
const OFFSCREEN_ARGS = ['--window-position=-32000,-32000'];

async function launch(profileDir, { headless, offscreen = false } = {}) {
  const args = [...CHROME_ARGS, ...(offscreen ? OFFSCREEN_ARGS : [])];
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless,
    viewport: { width: 1366, height: 900 },
    userAgent: USER_AGENT,
    args,
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  const page = context.pages().length ? context.pages()[0] : await context.newPage();
  return { context, page };
}

export function resolveProfileDir(override) {
  return path.resolve(override || process.env.WHATSAPP_WEB_PROFILE_DIR || 'apps/orca/chrome_profile/whatsapp-web');
}

// Modo LOGIN: siempre visible en pantalla, sin importar flags. El usuario tiene que ver el QR.
export async function connectForLogin({ profileDir } = {}) {
  return launch(resolveProfileDir(profileDir), { headless: false, offscreen: false });
}

// Modo ENVIO: sin ventana visible para el usuario. headless:true puro NO funciona (WhatsApp
// Web se queda atascado, ver nota arriba) — el default real es headed-pero-fuera-de-pantalla.
// WHATSAPP_WEB_FORCE_VISIBLE=1 fuerza la ventana on-screen para depurar.
export async function connectForSending({ profileDir, forceVisible } = {}) {
  const visibleOnScreen = forceVisible === true || process.env.WHATSAPP_WEB_FORCE_VISIBLE === '1';
  if (visibleOnScreen) return launch(resolveProfileDir(profileDir), { headless: false, offscreen: false });
  return launch(resolveProfileDir(profileDir), { headless: false, offscreen: true });
}
