import { Link } from "react-router-dom";
import { HeroCoreAnime } from "../../animations/HeroCoreAnime";
import { useScrollReveal } from "../../animations/useAnimeScroll";
import { FlowMedia } from "../../components/FlowMedia";

const PRODUCTS = [
  {
    name: "Orca",
    tag: "AI Orchestration",
    desc: "Operational Real-time Cognitive Orchestrator. Connects agents, workflows and business systems into one intelligent core.",
    accent: "#A5B4FC",
    media: {
      mp4: "/assets/global/product/orca.mp4",
      poster: "/assets/global/product/orca-poster.avif",
      alt: "AI orchestration core with real-time pulses for Orca.",
    },
  },
  {
    name: "AIHub",
    tag: "Intelligence Library",
    desc: "Centralized repository of AI blocks, automation patterns, models and workflows for enterprise deployment.",
    accent: "#C084FC",
    media: {
      mp4: "/assets/global/product/aihub.mp4",
      poster: "/assets/global/product/aihub-poster.avif",
      alt: "Secure intelligence library with modular AI blocks for AIHub.",
    },
  },
  {
    name: "GetUpBuilder",
    tag: "Delivery Accelerator",
    desc: "Project generator and accelerator for structured, production-ready software delivery.",
    accent: "#67E8F9",
    media: {
      mp4: "/assets/global/product/getupbuilder.mp4",
      poster: "/assets/global/product/getupbuilder-poster.avif",
      alt: "Software components assembling into a structured digital product architecture.",
    },
  },
  {
    name: "Galantes Jewelry",
    tag: "Commerce Case",
    desc: "Business case: inventory intelligence, sales analytics and digital commerce operations at scale.",
    accent: "#F0ABFC",
    media: {
      poster: "/assets/rd/case_study/galantes-jewelry-poster.avif",
      alt: "Premium jewelry retail operations dashboard with inventory and sales intelligence.",
    },
  },
  {
    name: "chefalitas",
    tag: "Food-Tech Case",
    desc: "Restaurant operations case: orders, kitchen workflow, delivery routing, inventory and analytics.",
    accent: "#6EE7B7",
    media: {
      poster: "/assets/rd/case_study/chefalitas-poster.avif",
      alt: "Professional restaurant operations dashboard for orders, kitchen workflow, delivery routing, inventory and analytics.",
    },
  },
];

const CAPABILITIES = [
  {
    icon: "◈",
    title: "Enterprise AI Agents",
    desc: "Autonomous agents that execute multi-step business workflows, decisions and integrations without manual intervention.",
  },
  {
    icon: "⬡",
    title: "System Integration",
    desc: "ERP, CRM, BI, accounting, e-commerce and legacy systems connected through clear, monitored contracts.",
  },
  {
    icon: "◎",
    title: "Operational Intelligence",
    desc: "Real-time dashboards, data orchestration and decision support layers built on your existing data.",
  },
  {
    icon: "▣",
    title: "Digital Transformation",
    desc: "End-to-end modernization of fragmented operations into scalable, automated digital ecosystems.",
  },
];

const METHODOLOGY = [
  { step: "01", title: "Architecture Audit", desc: "Map every system, handoff and data flow before proposing a single line of code." },
  { step: "02", title: "Intelligence Design", desc: "Design agents, integrations and automation as one coherent technical system." },
  { step: "03", title: "Operational Delivery", desc: "Ship with environments, observability and a codebase built for scale." },
];

const TRUST = [
  { label: "AI Agents", value: "Production-grade" },
  { label: "Integrations", value: "ERP · CRM · BI · APIs" },
  { label: "Infrastructure", value: "Cloud-native" },
];

export function GlobalHomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-global/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-accent-rd/5 blur-[100px]" />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative border-b border-border-subtle">
        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-10">
            <div className="inline-flex items-center rounded-full border border-accent-global/30 bg-accent-global-dim px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent-global">
              // Enterprise AI Architecture
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-6xl font-light leading-[0.92] tracking-tight text-text-main sm:text-7xl lg:text-8xl">
                Architectural{" "}
                <em className="not-italic text-accent-global">Intelligence</em>{" "}
                <br className="hidden lg:block" />
                for the Modern{" "}
                <br className="hidden lg:block" />
                Enterprise.
              </h1>
              <p className="max-w-xl text-lg font-light leading-relaxed text-text-muted">
                We design autonomous AI agents, integrated systems and operational intelligence layers that turn fragmented companies into scalable digital ecosystems.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="rounded-full bg-accent-global px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] text-bg-deep transition hover:scale-105 hover:bg-white"
              >
                Book Strategy Session
              </Link>
              <Link
                to="/methodology"
                className="rounded-full border border-border-mid px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] text-text-soft transition hover:border-accent-global hover:text-accent-global"
              >
                Explore Methodology
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {TRUST.map((t) => (
                <div key={t.label} className="border-l border-border-subtle pl-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{t.label}</p>
                  <p className="mt-2 text-sm font-medium text-text-soft">{t.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual — Flow media layer with anime.js fallback/overlay */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative h-[420px] w-[460px]">
              <FlowMedia
                mp4="/assets/global/hero/global-hero.mp4"
                webm="/assets/global/hero/global-hero.webm"
                poster="/assets/global/hero/global-hero-poster.avif"
                alt="Dark enterprise AI architecture core connecting agents, ERP, CRM, BI, automation, infrastructure, data and operations."
                priority="high"
                className="absolute inset-0 h-full w-full rounded-[2rem] object-cover opacity-70"
              />
              <div className="absolute inset-0 rounded-[2rem] bg-bg-deep/35 shadow-[inset_0_0_80px_rgba(15,17,21,0.9)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <HeroCoreAnime />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ────────────────────── */}
      <section className="border-b border-border-subtle bg-bg-surface/30">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-global">The Problem</p>
          <h2 className="mt-6 font-display text-3xl font-light leading-snug tracking-tight text-text-main sm:text-4xl">
            Modern companies operate with{" "}
            <em className="not-italic text-accent-global">fragmented systems</em>,{" "}
            disconnected teams and manual workflows.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-light leading-relaxed text-text-muted">
            GetUpSoft designs the intelligence layer that connects operations, data and decision-making into one scalable architecture.
          </p>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────── */}
      <CapabilitiesSection />

      {/* ── PRODUCTS ─────────────────────────────── */}
      <section className="border-y border-border-subtle bg-bg-surface/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div className="space-y-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-global">Products & Cases</p>
              <h2 className="font-display text-4xl font-light tracking-tight text-text-main sm:text-5xl">
                Our proprietary{" "}
                <em className="not-italic text-accent-global">ecosystem.</em>
              </h2>
            </div>
            <Link
              to="/products"
              className="shrink-0 border-b border-accent-global/40 pb-1 text-[11px] font-bold uppercase tracking-widest text-accent-global transition hover:border-accent-global hover:text-white"
            >
              View Full Portfolio →
            </Link>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <article
                key={p.name}
                className={`card-hover glass rounded-3xl p-8 ${i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
              >
                <FlowMedia
                  mp4={p.media.mp4}
                  poster={p.media.poster}
                  alt={p.media.alt}
                  className="mb-7 aspect-video w-full rounded-2xl object-cover opacity-80"
                />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{p.tag}</p>
                    <h3 className="mt-3 font-display text-2xl font-semibold" style={{ color: p.accent }}>
                      {p.name}
                    </h3>
                  </div>
                  <div className="h-2 w-2 rounded-full animate-pulse-soft" style={{ backgroundColor: p.accent }} />
                </div>
                <p className="mt-5 text-sm font-light leading-relaxed text-text-muted">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ──────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-16 lg:grid-cols-[0.8fr,1.2fr]">
          <div className="space-y-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-global">Methodology</p>
            <h2 className="font-display text-4xl font-light leading-snug tracking-tight text-text-main sm:text-5xl">
              How we{" "}
              <em className="not-italic text-accent-global">build.</em>
            </h2>
            <p className="text-base font-light leading-relaxed text-text-muted">
              From architecture to production. No hand-waving, no slide-decks-only engagements.
            </p>
          </div>
          <div className="space-y-10">
            {METHODOLOGY.map((m) => (
              <article key={m.step} className="grid gap-6 md:grid-cols-[80px,1fr]">
                <p className="font-display text-4xl font-light text-text-main/10">{m.step}</p>
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-text-main">{m.title}</h3>
                  <p className="font-light leading-relaxed text-text-muted">{m.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="glass rounded-4xl relative overflow-hidden p-12 lg:p-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-global/10 blur-[80px]" />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-global">Start Here</p>
              <h2 className="font-display text-4xl font-light tracking-tight text-text-main sm:text-5xl">
                Ready to architect your{" "}
                <em className="not-italic text-accent-global">intelligence layer?</em>
              </h2>
              <p className="max-w-lg font-light leading-relaxed text-text-muted">
                We work with enterprise teams, founders and operations leaders who need systems that actually hold together at scale.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                to="/contact"
                className="rounded-full bg-accent-global px-8 py-4 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-bg-deep transition hover:scale-105 hover:bg-white"
              >
                Book Strategy Session
              </Link>
              <Link
                to="/ai-agents"
                className="rounded-full border border-border-mid px-8 py-4 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-text-soft transition hover:border-accent-global hover:text-accent-global"
              >
                Explore AI Agents
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CapabilitiesSection() {
  const gridRef = useScrollReveal<HTMLDivElement>({ childSelector: "article", delay: 0, translateY: 20 });
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <div className="max-w-2xl space-y-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-global">Capabilities</p>
        <h2 className="font-display text-4xl font-light tracking-tight text-text-main sm:text-5xl">
          Not just tools.{" "}
          <em className="not-italic text-accent-global">Systems.</em>
        </h2>
      </div>
      <div ref={gridRef} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((c) => (
          <article key={c.title} className="card-hover glass rounded-2xl p-7 hover:border-accent-global/30">
            <p className="font-mono text-2xl text-accent-global/60">{c.icon}</p>
            <h3 className="mt-5 text-base font-semibold text-text-main">{c.title}</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-text-muted">{c.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
