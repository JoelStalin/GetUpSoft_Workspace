import { Link } from "react-router-dom";
import { RDCommandAnime } from "../../animations/RDCommandAnime";
import { useScrollReveal } from "../../animations/useAnimeScroll";

const SERVICES = [
  {
    icon: "◈",
    title: "Odoo ERP",
    desc: "Implementación completa de Odoo para ventas, inventario, contabilidad, CRM y facturación.",
    to: "/odoo-erp",
    accent: "#99F6E4",
  },
  {
    icon: "◎",
    title: "Facturación Electrónica",
    desc: "e-CF conforme a DGII. Emisión, validación y reportes integrados con tu sistema de gestión.",
    to: "/facturacion-electronica",
    accent: "#67E8F9",
  },
  {
    icon: "⬡",
    title: "Infraestructura",
    desc: "Servidores, cableado estructurado, racks, WiFi empresarial y continuidad operativa.",
    to: "/infraestructura",
    accent: "#A5B4FC",
  },
  {
    icon: "▣",
    title: "Redes Empresariales",
    desc: "Diseño e instalación de redes LAN/WiFi para oficinas, almacenes y sucursales.",
    to: "/redes-empresariales",
    accent: "#C084FC",
  },
];

const SECTORS = [
  "Distribuidoras y almacenes",
  "Retail y comercios",
  "Ferreterías",
  "Restaurantes y food-tech",
  "Logística y transporte",
  "Servicios profesionales",
  "Empresas en crecimiento",
];

const CASES = [
  {
    name: "Galantes Jewelry",
    tag: "Retail · Inventario",
    desc: "Implementación de Odoo ERP para gestión de inventario, ventas y facturación electrónica en joyería premium.",
    accent: "#F0ABFC",
  },
  {
    name: "chefalitas",
    tag: "Restaurante · Food-tech",
    desc: "Sistema POS, gestión de cocina, delivery y analytics para operación de restaurante en crecimiento.",
    accent: "#6EE7B7",
  },
];

const PROBLEMS = [
  "Inventario difícil de controlar",
  "Facturación manual sin cumplimiento DGII",
  "Sistemas desconectados entre áreas",
  "Redes inestables que interrumpen la operación",
  "Sin visibilidad en tiempo real del negocio",
];

const PROCESS = [
  { step: "01", title: "Diagnóstico", desc: "Evaluamos tus sistemas, procesos y necesidades antes de proponer nada." },
  { step: "02", title: "Diseño", desc: "Definimos la solución específica para tu operación: ERP, infraestructura o ambos." },
  { step: "03", title: "Implementación", desc: "Instalamos, configuramos y capacitamos con soporte continuo." },
];

export function RDHomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent-rd/8 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-[350px] w-[350px] translate-x-1/3 rounded-full bg-accent-global/5 blur-[90px]" />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative border-b border-border-subtle">
        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-10">
            <div className="inline-flex items-center rounded-full border border-accent-rd/30 bg-accent-rd-dim px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent-rd">
              // Soluciones Tangibles · Software + Hardware
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-6xl font-light leading-[0.92] tracking-tight text-text-main sm:text-7xl lg:text-8xl">
                Infraestructura y{" "}
                <em className="not-italic text-accent-rd">gestión</em>{" "}
                <br className="hidden lg:block" />
                para el éxito{" "}
                <br className="hidden lg:block" />
                local.
              </h1>
              <p className="max-w-xl text-lg font-light leading-relaxed text-text-muted">
                Implementamos Odoo ERP, facturación electrónica e infraestructura empresarial para que tu operación funcione sin interrupciones.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/contacto"
                className="rounded-full bg-accent-rd px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] text-bg-deep transition hover:scale-105 hover:bg-white"
              >
                Solicitar Diagnóstico
              </Link>
              <Link
                to="/odoo-erp"
                className="rounded-full border border-border-mid px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] text-text-soft transition hover:border-accent-rd hover:text-accent-rd"
              >
                Ver Servicios
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: "ERP", value: "Odoo Certified" },
                { label: "Facturación", value: "DGII · e-CF" },
                { label: "Soporte", value: "Local · RD" },
              ].map((t) => (
                <div key={t.label} className="border-l border-border-subtle pl-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{t.label}</p>
                  <p className="mt-2 text-sm font-medium text-text-soft">{t.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual — anime.js powered */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <RDCommandAnime />
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ────────────────────── */}
      <section className="border-b border-border-subtle bg-bg-surface/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-rd">El Problema</p>
              <h2 className="font-display text-3xl font-light leading-snug tracking-tight text-text-main sm:text-4xl">
                Muchas empresas dominicanas operan con{" "}
                <em className="not-italic text-accent-rd">sistemas desconectados.</em>
              </h2>
              <p className="font-light leading-relaxed text-text-muted">
                GetUpSoft conecta gestión, infraestructura y soporte para que la operación funcione con más control.
              </p>
            </div>
            <ul className="space-y-4">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-center gap-4 text-text-muted">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-rd" />
                  <span className="font-light">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────── */}
      <ServicesSection />

      {/* ── SECTORS ──────────────────────────────── */}
      <section className="border-y border-border-subtle bg-bg-surface/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-24">
            <div className="shrink-0 space-y-4 lg:max-w-sm">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-rd">Sectores</p>
              <h2 className="font-display text-3xl font-light tracking-tight text-text-main sm:text-4xl">
                Atendemos empresas de{" "}
                <em className="not-italic text-accent-rd">todos los sectores.</em>
              </h2>
              <Link
                to="/sectores"
                className="inline-block border-b border-accent-rd/40 pb-1 text-[11px] font-bold uppercase tracking-widest text-accent-rd transition hover:border-accent-rd"
              >
                Ver todos →
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {SECTORS.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border-mid bg-bg-elevated/40 px-4 py-2 text-sm font-light text-text-soft transition hover:border-accent-rd/40 hover:text-text-main"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CASES ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="space-y-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-rd">Casos</p>
            <h2 className="font-display text-4xl font-light tracking-tight text-text-main sm:text-5xl">
              Empresas que ya{" "}
              <em className="not-italic text-accent-rd">operan mejor.</em>
            </h2>
          </div>
          <Link
            to="/casos"
            className="shrink-0 border-b border-accent-rd/40 pb-1 text-[11px] font-bold uppercase tracking-widest text-accent-rd transition hover:border-accent-rd"
          >
            Ver todos los casos →
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {CASES.map((c) => (
            <article key={c.name} className="card-hover glass rounded-3xl p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{c.tag}</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold" style={{ color: c.accent }}>
                    {c.name}
                  </h3>
                </div>
                <div className="h-2 w-2 rounded-full animate-pulse-soft" style={{ backgroundColor: c.accent }} />
              </div>
              <p className="mt-5 font-light leading-relaxed text-text-muted">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────── */}
      <section className="border-y border-border-subtle bg-bg-surface/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-[0.8fr,1.2fr]">
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-rd">Proceso</p>
              <h2 className="font-display text-4xl font-light leading-snug tracking-tight text-text-main sm:text-5xl">
                De la red a la{" "}
                <em className="not-italic text-accent-rd">factura.</em>
              </h2>
            </div>
            <div className="space-y-10">
              {PROCESS.map((p) => (
                <article key={p.step} className="grid gap-6 md:grid-cols-[80px,1fr]">
                  <p className="font-display text-4xl font-light text-text-main/10">{p.step}</p>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold text-text-main">{p.title}</h3>
                    <p className="font-light leading-relaxed text-text-muted">{p.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="glass rounded-4xl relative overflow-hidden p-12 lg:p-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent-rd/10 blur-[60px]" />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-rd">¿Listo para empezar?</p>
              <h2 className="font-display text-4xl font-light tracking-tight text-text-main sm:text-5xl">
                Evalúa tu{" "}
                <em className="not-italic text-accent-rd">infraestructura</em>{" "}
                hoy.
              </h2>
              <p className="max-w-lg font-light leading-relaxed text-text-muted">
                Implementamos Odoo ERP, facturación electrónica, redes, servidores e infraestructura tecnológica para empresas que necesitan orden, visibilidad y continuidad.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                to="/contacto"
                className="rounded-full bg-accent-rd px-8 py-4 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-bg-deep transition hover:scale-105 hover:bg-white"
              >
                Solicitar Diagnóstico
              </Link>
              <Link
                to="/odoo-erp"
                className="rounded-full border border-border-mid px-8 py-4 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-text-soft transition hover:border-accent-rd hover:text-accent-rd"
              >
                Ver Odoo ERP
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServicesSection() {
  const gridRef = useScrollReveal<HTMLDivElement>({ childSelector: "a", delay: 0, translateY: 20 });
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <div className="max-w-2xl space-y-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-rd">Servicios</p>
        <h2 className="font-display text-4xl font-light tracking-tight text-text-main sm:text-5xl">
          Todo lo que{" "}
          <em className="not-italic text-accent-rd">tu empresa necesita.</em>
        </h2>
      </div>
      <div ref={gridRef} className="mt-16 grid gap-6 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <Link key={s.title} to={s.to} className="block">
            <article className="card-hover glass h-full rounded-3xl p-8">
              <p className="font-mono text-2xl" style={{ color: s.accent }}>{s.icon}</p>
              <h3 className="mt-5 font-display text-xl font-semibold text-text-main">{s.title}</h3>
              <p className="mt-3 font-light leading-relaxed text-text-muted">{s.desc}</p>
              <p className="mt-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: s.accent }}>
                Ver más →
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
