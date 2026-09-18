from __future__ import annotations

from dataclasses import dataclass
from html import escape
import re
from pathlib import Path
from typing import Any

from ai_automation_orchestrator.config import repository_root


@dataclass(frozen=True, slots=True)
class DesignPageResult:
    output_path: Path
    public_path: str
    title: str
    summary_markdown: str
    progress_path: Path
    progress_percent: int


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return slug or "landing-page"


def generate_professional_page(settings: dict[str, Any], objective: str) -> DesignPageResult:
    project = str(settings.get("project") or "Corredor de Seguros")
    audience = str(settings.get("audience") or "familias, profesionales y pequenas empresas")
    primary_cta = str(settings.get("primary_cta") or "Solicitar evaluacion")
    secondary_cta = str(settings.get("secondary_cta") or "Ver coberturas")
    phone = str(settings.get("phone") or "+1 (809) 555-0145")
    email = str(settings.get("email") or "asesoria@seguros.local")
    city = str(settings.get("city") or "Santo Domingo")
    slug = slugify(str(settings.get("slug") or project))
    stages = [
        {"key": "research", "label": "Investigacion", "done": True},
        {"key": "architecture", "label": "Arquitectura", "done": True},
        {"key": "design", "label": "Diseno", "done": True},
        {"key": "backend", "label": "Back-end", "done": True},
        {"key": "frontend", "label": "Front-end", "done": True},
        {"key": "testing", "label": "Testing", "done": True},
    ]
    progress_percent = round(sum(1 for stage in stages if stage["done"]) / len(stages) * 100)

    output_dir = repository_root() / "outputs" / "design-pages" / slug
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "index.html"
    progress_path = output_dir / "progress.json"

    html = build_insurance_landing_html(
        project=project,
        audience=audience,
        objective=objective,
        primary_cta=primary_cta,
        secondary_cta=secondary_cta,
        phone=phone,
        email=email,
        city=city,
        progress_percent=progress_percent,
        stages=stages,
    )
    output_path.write_text(html, encoding="utf-8")
    progress_path.write_text(
        json_dumps(
            {
                "project": project,
                "progress_percent": progress_percent,
                "stages": stages,
                "objective": objective,
                "output_path": str(output_path),
            }
        ),
        encoding="utf-8",
    )

    summary = (
        f"# Landing generada: {project}\n\n"
        f"- Tipo: corredor de seguros\n"
        f"- Audiencia: {audience}\n"
        f"- Archivo: `{output_path}`\n"
        f"- Avance del proyecto: {progress_percent}%\n"
        f"- CTA principal: {primary_cta}\n"
        f"- Contacto: {phone} / {email}\n\n"
        "## Resultado\n\n"
        "Orca ejecuto el workflow de diseno profesional y genero una landing HTML estatica con hero, "
        "servicios, proceso, prueba de confianza, formulario, progreso por etapas y animaciones CSS livianas."
    )

    return DesignPageResult(
        output_path=output_path,
        public_path=f"outputs/design-pages/{slug}/index.html",
        title=project,
        summary_markdown=summary,
        progress_path=progress_path,
        progress_percent=progress_percent,
    )


def json_dumps(data: dict[str, Any]) -> str:
    import json

    return json.dumps(data, ensure_ascii=False, indent=2)


def build_insurance_landing_html(
    *,
    project: str,
    audience: str,
    objective: str,
    primary_cta: str,
    secondary_cta: str,
    phone: str,
    email: str,
    city: str,
    progress_percent: int,
    stages: list[dict[str, Any]],
) -> str:
    project_html = escape(project)
    audience_html = escape(audience)
    objective_html = escape(objective)
    primary_cta_html = escape(primary_cta)
    secondary_cta_html = escape(secondary_cta)
    phone_html = escape(phone)
    email_html = escape(email)
    city_html = escape(city)
    stages_html = "\n".join(
        f'<div class="stage"><span>{escape(str(stage["label"]))}</span><i>{"Hecho" if stage["done"] else "Pendiente"}</i></div>'
        for stage in stages
    )

    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{project_html} | Corredor de Seguros</title>
  <meta name="description" content="Asesoria profesional en seguros personales, familiares y empresariales en {city_html}.">
  <style>
    :root {{
      color-scheme: light;
      --ink: #10151f;
      --muted: #5b6575;
      --line: #d9e1ea;
      --paper: #f7f9fc;
      --panel: #ffffff;
      --navy: #17233a;
      --blue: #2f6fed;
      --teal: #0b8f8a;
      --gold: #c99b3b;
      --radius: 8px;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; background: var(--paper); color: var(--ink); line-height: 1.55; }}
    a {{ color: inherit; }}
    .site-header {{
      position: sticky; top: 0; z-index: 10; background: rgba(247, 249, 252, .92);
      border-bottom: 1px solid var(--line); backdrop-filter: blur(16px);
    }}
    .nav {{ max-width: 1180px; margin: 0 auto; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }}
    .brand {{ font-weight: 800; letter-spacing: .01em; }}
    .brand span {{ color: var(--blue); }}
    .nav-links {{ display: flex; align-items: center; gap: 18px; color: var(--muted); font-size: 14px; }}
    .nav-links a {{ text-decoration: none; }}
    .hero {{
      max-width: 1180px; margin: 0 auto; padding: 82px 24px 44px;
      display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr); gap: 48px; align-items: center;
    }}
    .eyebrow {{ color: var(--teal); font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .14em; }}
    h1 {{ font-size: clamp(40px, 6vw, 76px); line-height: .94; margin: 16px 0 22px; letter-spacing: 0; }}
    .lead {{ font-size: clamp(17px, 2vw, 21px); color: var(--muted); max-width: 670px; }}
    .actions {{ display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }}
    .btn {{
      min-height: 48px; border-radius: var(--radius); border: 1px solid var(--navy); padding: 13px 18px;
      text-decoration: none; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;
    }}
    .btn.primary {{ background: var(--navy); color: white; box-shadow: 0 18px 34px rgba(23,35,58,.18); }}
    .btn.secondary {{ background: white; color: var(--navy); }}
    .command {{
      background: var(--navy); color: white; border-radius: var(--radius); padding: 24px; overflow: hidden;
      box-shadow: 0 28px 70px rgba(23,35,58,.26); border: 1px solid rgba(255,255,255,.12);
    }}
    .command-head {{ display: flex; justify-content: space-between; color: #aeb9ca; font-size: 12px; margin-bottom: 22px; }}
    .risk-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }}
    .risk {{ background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 16px; }}
    .risk strong {{ display: block; font-size: 24px; color: #fff; }}
    .risk span {{ color: #bac5d7; font-size: 13px; }}
    section {{ max-width: 1180px; margin: 0 auto; padding: 48px 24px; }}
    .section-title {{ max-width: 720px; }}
    h2 {{ font-size: clamp(28px, 4vw, 44px); line-height: 1; margin: 0 0 14px; }}
    .grid-3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }}
    .card {{ background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px; min-height: 188px; }}
    .card h3 {{ margin: 0 0 10px; font-size: 18px; }}
    .card p {{ margin: 0; color: var(--muted); }}
    .process {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); margin-top: 28px; }}
    .step {{ background: white; padding: 22px; }}
    .step b {{ color: var(--blue); }}
    .cta-band {{ background: var(--navy); color: white; max-width: none; margin-top: 48px; }}
    .cta-inner {{ max-width: 1180px; margin: 0 auto; padding: 56px 24px; display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }}
    .cta-inner p {{ color: #c6cfdd; }}
    form {{ background: white; color: var(--ink); border-radius: var(--radius); padding: 20px; display: grid; gap: 12px; }}
    label {{ font-size: 13px; font-weight: 800; color: var(--muted); }}
    input, select, textarea {{ width: 100%; border: 1px solid var(--line); border-radius: 6px; padding: 12px; font: inherit; }}
    textarea {{ min-height: 92px; resize: vertical; }}
    footer {{ max-width: 1180px; margin: 0 auto; padding: 28px 24px 44px; color: var(--muted); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }}
    @keyframes pulseLine {{ 0%, 100% {{ opacity: .35; transform: scaleX(.85); }} 50% {{ opacity: 1; transform: scaleX(1); }} }}
    .data-line {{ height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); transform-origin: center; animation: pulseLine 3.5s ease-in-out infinite; margin: 20px 0; }}
    .progress-wrap {{ margin-top: 18px; display: grid; gap: 10px; }}
    .progress-track {{ height: 12px; background: rgba(255,255,255,.12); border-radius: 999px; overflow: hidden; }}
    .progress-fill {{ width: {progress_percent}%; height: 100%; background: linear-gradient(90deg, var(--gold), #74d3ff); border-radius: inherit; }}
    .stages {{ display: grid; gap: 8px; margin-top: 14px; font-size: 13px; color: #d7e0ee; }}
    .stage {{ display: flex; justify-content: space-between; gap: 12px; align-items: center; }}
    .stage i {{ font-style: normal; color: #86f2c6; }}
    @media (prefers-reduced-motion: reduce) {{ .data-line {{ animation: none; }} }}
    @media (max-width: 860px) {{
      .hero, .cta-inner {{ grid-template-columns: 1fr; }}
      .grid-3, .process {{ grid-template-columns: 1fr; }}
      .nav-links {{ display: none; }}
      .hero {{ padding-top: 52px; }}
    }}
  </style>
</head>
<body>
  <header class="site-header">
    <nav class="nav" aria-label="Principal">
      <div class="brand">{project_html}<span>.</span></div>
      <div class="nav-links">
        <a href="#coberturas">Coberturas</a>
        <a href="#proceso">Proceso</a>
        <a href="#contacto">Contacto</a>
      </div>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div>
        <div class="eyebrow">Corredor de seguros en {city_html}</div>
        <h1>Proteccion clara para decisiones importantes.</h1>
        <p class="lead">{project_html} asesora a {audience_html} para comparar coberturas, reducir riesgos y contratar seguros con criterio profesional.</p>
        <p class="lead">{objective_html}</p>
        <div class="actions">
          <a class="btn primary" href="#contacto">{primary_cta_html}</a>
          <a class="btn secondary" href="#coberturas">{secondary_cta_html}</a>
        </div>
      </div>
      <aside class="command" aria-label="Resumen operativo de seguros">
        <div class="command-head"><span>Risk command center</span><span>Disponible 24/7</span></div>
        <div class="risk-grid">
          <div class="risk"><strong>Auto</strong><span>Responsabilidad, full y flotillas</span></div>
          <div class="risk"><strong>Salud</strong><span>Planes individuales y colectivos</span></div>
          <div class="risk"><strong>Vida</strong><span>Proteccion familiar y patrimonial</span></div>
          <div class="risk"><strong>Empresa</strong><span>Activos, responsabilidad y continuidad</span></div>
        </div>
        <div class="data-line"></div>
        <div class="progress-wrap" aria-label="Estado del proyecto">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
            <strong>Avance del proyecto</strong>
            <span>{progress_percent}%</span>
          </div>
          <div class="progress-track"><div class="progress-fill"></div></div>
          <div class="stages">
            {stages_html}
          </div>
        </div>
        <p style="color:#c6cfdd;margin:0">Analisis comparativo, gestion de renovaciones y acompanamiento ante reclamaciones.</p>
      </aside>
    </section>

    <section id="coberturas">
      <div class="section-title">
        <h2>Coberturas organizadas para comprar con confianza.</h2>
        <p class="lead">El valor no esta solo en la poliza; esta en entender limites, exclusiones, deducibles y servicio cuando ocurre un evento.</p>
      </div>
      <div class="grid-3">
        <article class="card"><h3>Personas y familias</h3><p>Salud, vida, vehiculo, hogar y viajes con seleccion comparativa y soporte de renovacion.</p></article>
        <article class="card"><h3>Empresas</h3><p>Responsabilidad civil, incendio, robo, transporte, flotillas, empleados y continuidad operativa.</p></article>
        <article class="card"><h3>Reclamaciones</h3><p>Acompanamiento documental y seguimiento para reducir friccion durante el proceso.</p></article>
      </div>
    </section>

    <section id="proceso">
      <div class="section-title">
        <h2>Un proceso simple, trazable y profesional.</h2>
      </div>
      <div class="process">
        <div class="step"><b>01</b><h3>Diagnostico</h3><p>Levantamos tus riesgos, presupuesto y prioridades.</p></div>
        <div class="step"><b>02</b><h3>Comparacion</h3><p>Evaluamos opciones con criterios claros.</p></div>
        <div class="step"><b>03</b><h3>Contratacion</h3><p>Coordinamos documentos y emision.</p></div>
        <div class="step"><b>04</b><h3>Seguimiento</h3><p>Te acompanamos en renovaciones y reclamaciones.</p></div>
      </div>
    </section>

    <section class="cta-band" id="contacto">
      <div class="cta-inner">
        <div>
          <div class="eyebrow">Evaluacion sin compromiso</div>
          <h2>Agenda una revision de tus coberturas actuales.</h2>
          <p>Contacto directo: {phone_html} · {email_html}</p>
        </div>
        <form>
          <label for="name">Nombre</label>
          <input id="name" name="name" autocomplete="name" placeholder="Tu nombre">
          <label for="insurance">Seguro de interes</label>
          <select id="insurance" name="insurance">
            <option>Vehiculo</option>
            <option>Salud</option>
            <option>Vida</option>
            <option>Empresa</option>
          </select>
          <label for="message">Mensaje</label>
          <textarea id="message" name="message" placeholder="Cuéntanos que necesitas evaluar"></textarea>
          <button class="btn primary" type="button">{primary_cta_html}</button>
        </form>
      </div>
    </section>
  </main>
  <footer>
    <span>{project_html} · Corredor de seguros</span>
    <span>{city_html} · {phone_html}</span>
  </footer>
</body>
</html>
"""
