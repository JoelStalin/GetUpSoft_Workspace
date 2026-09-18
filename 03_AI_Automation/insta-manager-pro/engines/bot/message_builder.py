import logging
from bot.models import ExtractionResult

logger = logging.getLogger("insta_bot")

# ── Para seguidores de Instagram (invitando a Facebook) ───────────────────────
TEMPLATE_IG_TO_FB = """¡Hola, {nombre_persona}! Espero que estés muy bien. Te escribe Daniello, el de la joyería (Galante's Jewelry). 🌊

Quería saludarte personalmente y dejarte por acá nuestras páginas más profesionales para que me sigas por allá y sigamos conectados.

Hi, {nombre_persona}! I hope you're doing well. It's Daniello from the jewelry store (Galante's Jewelry). 🌊
I wanted to reach out personally to share our professional pages with you so we can stay connected.

Acá te dejo los enlaces / Here are the links:
👍 Facebook: https://www.facebook.com/profile.php?id=61574429843836
🌐 Web: https://galantesjewelry.com/

¡Gracias por el apoyo de siempre y que estés muy bien! / Thank you for your continued support, wishing you the best! 💎

Daniello Galante
CEO, Galante's Jewelry by the sea"""

TEMPLATE_IG_TO_FB_GENERIC = """¡Hola! Espero que estés muy bien. Te escribe Daniello, el de la joyería (Galante's Jewelry). 🌊

Quería saludarte personalmente y dejarte por acá nuestras páginas más profesionales para que me sigas por allá y sigamos conectados.

Hi! I hope you're doing well. It's Daniello from the jewelry store (Galante's Jewelry). 🌊
I wanted to reach out personally to share our professional pages with you so we can stay connected.

Acá te dejo los enlaces / Here are the links:
👍 Facebook: https://www.facebook.com/profile.php?id=61574429843836
🌐 Web: https://galantesjewelry.com/

¡Gracias por el apoyo de siempre y que estés muy bien! / Thank you for your continued support, wishing you the best! 💎

Daniello Galante
CEO, Galante's Jewelry by the sea"""

# ── Para amigos de Facebook (invitando a Instagram) ───────────────────────────
TEMPLATE_FB_TO_IG = """¡Hola, {nombre_persona}! Espero que estés muy bien. Te escribe Daniello, el de la joyería (Galante's Jewelry). 🌊

Quería saludarte personalmente y dejarte por acá nuestras páginas más profesionales para que me sigas por allá y sigamos conectados.

Hi, {nombre_persona}! I hope you're doing well. It's Daniello from the jewelry store (Galante's Jewelry). 🌊
I wanted to reach out personally to share our professional pages with you so we can stay connected.

Acá te dejo los enlaces / Here are the links:
📸 Instagram: https://www.instagram.com/galantesjewelrybythesea/
🌐 Web: https://galantesjewelry.com/

¡Gracias por el apoyo de siempre y que estés muy bien! / Thank you for your continued support, wishing you the best! 💎

Daniello Galante
CEO, Galante's Jewelry by the sea"""

TEMPLATE_FB_TO_IG_GENERIC = """¡Hola! Espero que estés muy bien. Te escribe Daniello, el de la joyería (Galante's Jewelry). 🌊

Quería saludarte personalmente y dejarte por acá nuestras páginas más profesionales para que me sigas por allá y sigamos conectados.

Hi! I hope you're doing well. It's Daniello from the jewelry store (Galante's Jewelry). 🌊
I wanted to reach out personally to share our professional pages with you so we can stay connected.

Acá te dejo los enlaces / Here are the links:
📸 Instagram: https://www.instagram.com/galantesjewelrybythesea/
🌐 Web: https://galantesjewelry.com/

¡Gracias por el apoyo de siempre y que estés muy bien! / Thank you for your continued support, wishing you the best! 💎

Daniello Galante
CEO, Galante's Jewelry by the sea"""

# ── PLANTILLAS DIVIDIDAS (SPLIT EXTENDIDO 4 PARTES) ──────────────────────────
# Parte 1: Intro
SPLIT_IG_INTRO = """¡Hola{nombre}! Espero que estés muy bien. Te escribe Daniello, el de la joyería (Galante's Jewelry). 🌊

Quería saludarte personalmente y dejarte por acá nuestras páginas más profesionales para que me sigas por allá y sigamos conectados.

Hi{nombre}! I hope you're doing well. It's Daniello from the jewelry store (Galante's Jewelry). 🌊
I wanted to reach out personally to share our professional pages with you so we can stay connected."""

# --- TEMPLATES CORRECTIVOS v12.0 ---
CORRECTIVE_IG_INTRO = """¡Hola{nombre}! Soy Daniello de Galante's Jewelry.🌊
Me paso por aquí para saludarte de nuevo y dejarte nuestra página oficial de Facebook corregida, ya que la anterior que te enviamos tenía un error al abrirse."""

# Parte 2: Facebook Link (v11.7 - URL Profesional)
SPLIT_IG_FB = "Facebook: https://www.facebook.com/people/Galantes-Jewelry-by-The-Sea/61574429843836"

# Parte 3: Web Link
SPLIT_IG_WEB = "Tienda: https://galantesjewelry.com/"

# Parte 4: Cierre
SPLIT_IG_OUTRO = """¡Gracias por el apoyo de siempre y que estés muy bien! / Thank you for your continued support, wishing you the best! 💎

Daniello Galante
CEO, Galante's Jewelry by the sea"""

def build_message_split(nombre: str | None, platform: str = "instagram") -> list[str]:
    """
    Returns 4 message parts to be sent sequentially (mobile optimized).
    """
    name_str = f", {nombre.strip().split()[0]}" if nombre and nombre.strip() and "Joyero" not in nombre else ""
    
    return [
        SPLIT_IG_INTRO.format(nombre=name_str),
        SPLIT_IG_FB,
        SPLIT_IG_WEB,
        SPLIT_IG_OUTRO
    ]

class MessageBuilder:
    def build_split(self, result: ExtractionResult) -> list[str]:
        logger.info("[STEP] Building 4-part split message draft")
        raw_name = result.visible_name or ""
        return build_message_split(raw_name)

    def build_corrective(self, result: ExtractionResult) -> list[str]:
        logger.info("[STEP] Building 3-part corrective message draft")
        raw_name = result.visible_name or ""
        name_str = f", {raw_name.strip().split()[0]}" if raw_name and raw_name.strip() else ""
        intro = CORRECTIVE_IG_INTRO.format(nombre=name_str)
        # Usamos los links oficiales v11.7 restaurados
        return [intro, SPLIT_IG_FB, SPLIT_IG_WEB, SPLIT_IG_OUTRO]

    def build(self, result: ExtractionResult) -> str:
        parts = self.build_split(result)
        return "\n\n".join(parts)
