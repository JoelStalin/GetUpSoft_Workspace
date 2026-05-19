import { Link } from "react-router-dom";
import { HeroCoreAnime } from "../../animations/HeroCoreAnime";
import { useScrollReveal } from "../../animations/useAnimeScroll";
import { FlowMedia } from "../../components/FlowMedia";

const PRODUCTS = [
  {
    name: "Orca",
    tag: "AI Orchestration",
    desc: "Operational Real-time Cognitive Orchestrator. Connects agents, workflows and business systems into one intelligent core.",
    accent: "#3B82F6",
    media: {
      poster: "/assets/global/product/orca-poster.svg",
      alt: "AI orchestration core with real-time pulses for Orca.",
    },
  },
  {
    name: "AIHub",
    tag: "Intelligence Library",
    desc: "Centralized repository of AI blocks, automation patterns, models and workflows for enterprise deployment.",
    accent: "#A855F7",
    media: {
      poster: "/assets/global/product/aihub-poster.svg",
      alt: "Secure intelligence library with modular AI blocks for AIHub.",
    },
  },
  {
    name: "GetUpBuilder",
    tag: "Delivery Accelerator",
    desc: "Project generator and accelerator for structured, production-ready software delivery.",
    accent: "#06B6D4",
    media: {
      poster: "/assets/global/product/getupbuilder-poster.svg",
      alt: "Software components assembling into a structured digital product architecture.",
    },
  },
  {
    name: "Galantes Jewelry",
    tag: "Commerce Case",
    desc: "Business case: inventory intelligence, sales analytics and digital commerce operations at scale.",
    accent: "#EC4899",
    media: {
      poster: "/assets/rd/case_study/galantes-jewelry-poster.svg",
      alt: "Premium jewelry retail operations dashboard with inventory and sales intelligence.",
    },
  },
  {
    name: "chefalitas",
    tag: "Food-Tech Case",
    desc: "Restaurant operations case: orders, kitchen workflow, delivery routing, inventory and analytics.",
    accent: "#10B981",
    media: {
      poster: "/assets/rd/case_study/chefalitas-poster.svg",
      alt: "Professional restaurant operations dashboard for orders, kitchen workflow, delivery routing, inventory and analytics.",
    },
  },
];

const CAPABILITIES = [
  {
    icon: "🤖",
    title: "Enterprise AI Agents",
    desc: "Autonomous agents that execute multi-step business workflows, decisions and integrations without manual intervention.",
  },
  {
    icon: "🔗",
    title: "System Integration",
    desc: "ERP, CRM, BI, accounting, e-commerce and legacy systems connected through clear, monitored contracts.",
  },
  {
    icon: "📊",
    title: "Operational Intelligence",
    desc: "Real-time dashboards, data orchestration and decision support layers built on your existing data.",
  },
  {
    icon: "🚀",
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
    <div className="relative overflow-hidden bg-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200 blur-[120px] opacity-30" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-purple-200 blur-[100px] opacity-20" />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative border-b border-gray-200">
        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-10">
            <div className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-700">
              // Enterprise AI Architecture
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-gray-900">
                Architectural{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligence
                </span>{" "}
                <br className="hidden lg:block" />
                for the Modern Enterprise.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-gray-600">
                We design autonomous AI agents, integrated systems and operational intelligence layers that turn fragmented companies into scalable digital ecosystems.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="rounded-lg bg-blue-600 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
              >
                Book Strategy Session
              </Link>
              <Link
                to="/methodology"
                className="rounded-lg border-2 border-gray-300 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-900 transition hover:border-blue-600 hover:text-blue-600"
              >
                Explore Methodology
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {TRUST.map((t) => (
                <div key={t.label} className="border-l-2 border-gray-300 pl-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-600">{t.label}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{t.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative h-[420px] w-[460px]">
              <FlowMedia
                poster="/assets/global/hero/global-hero-poster.svg"
                alt="Enterprise AI architecture core connecting agents, ERP, CRM, BI, automation, infrastructure, data and operations."
                priority="high"
                className="absolute inset-0 h-full w-full rounded-[2rem] object-cover opacity-80"
              />
              <div className="absolute inset-0 rounded-[2rem] bg-white/30 shadow-[inset_0_0_80px_rgba(255,255,255,0.5)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <HeroCoreAnime />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ────────────────────── */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">The Problem</p>
          <h2 className="mt-6 text-3xl sm:text-4xl font-bold leading-snug tracking-tight text-gray-900">
            Modern companies operate with{" "}
            <span className="text-blue-600">fragmented systems</span>,{" "}
            disconnected teams and manual workflows.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600">
            GetUpSoft designs the intelligence layer that connects operations, data and decision-making into one scalable architecture.
          </p>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────── */}
      <CapabilitiesSection />

      {/* ── PRODUCTS ─────────────────────────────── */}
      <section className="border-y border-gray-200 bg-gray-50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Products & Cases</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Our proprietary{" "}
                <span className="text-blue-600">ecosystem.</span>
              </h2>
            </div>
            <Link
              to="/products"
              className="shrink-0 border-b-2 border-blue-600 pb-1 text-xs font-bold uppercase tracking-widest text-blue-600 transition hover:text-blue-700"
            >
              View Full Portfolio →
            </Link>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <article
                key={p.name}
                className={`card-hover bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition ${
                  i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <FlowMedia
                  poster={p.media.poster}
                  alt={p.media.alt}
                  className="mb-7 aspect-video w-full rounded-2xl object-cover opacity-80"
                />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-600">{p.tag}</p>
                    <h3 className="mt-3 text-2xl font-bold" style={{ color: p.accent }}>
                      {p.name}
                    </h3>
                  </div>
                  <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: p.accent }} />
                </div>
                <p className="mt-5 text-sm leading-relaxed text-gray-600">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ──────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-16 lg:grid-cols-[0.8fr,1.2fr]">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Methodology</p>
            <h2 className="text-4xl sm:text-5xl font-bold leading-snug tracking-tight text-gray-900">
              How we{" "}
              <span className="text-blue-600">build.</span>
            </h2>
            <p className="text-base leading-relaxed text-gray-600">
              From architecture to production. No hand-waving, no slide-decks-only engagements.
            </p>
          </div>
          <div className="space-y-10">
            {METHODOLOGY.map((m) => (
              <article key={m.step} className="grid gap-6 md:grid-cols-[80px,1fr]">
                <p className="text-4xl font-bold text-gray-200">{m.step}</p>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{m.title}</h3>
                  <p className="leading-relaxed text-gray-600">{m.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="rounded-3xl relative overflow-hidden p-12 lg:p-20 bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-300 blur-[80px] opacity-20" />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Start Here</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Ready to architect your{" "}
                <span className="text-blue-600">intelligence layer?</span>
              </h2>
              <p className="max-w-lg leading-relaxed text-gray-600">
                We work with enterprise teams, founders and operations leaders who need systems that actually hold together at scale.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                to="/contact"
                className="rounded-lg bg-blue-600 text-white px-8 py-4 text-center text-xs font-bold uppercase tracking-widest transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
              >
                Book Strategy Session
              </Link>
              <Link
                to="/ai-agents"
                className="rounded-lg border-2 border-gray-300 px-8 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-900 transition hover:border-blue-600 hover:text-blue-600"
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
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Capabilities</p>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Not just tools.{" "}
          <span className="text-blue-600">Systems.</span>
        </h2>
      </div>
      <div ref={gridRef} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((c) => (
          <article key={c.title} className="card-hover bg-white rounded-xl border border-gray-200 p-7 hover:border-blue-300 hover:shadow-lg transition">
            <p className="text-3xl">{c.icon}</p>
            <h3 className="mt-5 text-base font-bold text-gray-900">{c.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{c.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
