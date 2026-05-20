import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { Button } from "../../components/ui/Button";

const PRODUCTS = [
  {
    name: "Orca",
    tag: "AI Orchestration",
    desc: "Operational Real-time Cognitive Orchestrator. Connects agents, workflows and business systems into one intelligent core.",
    color: "primary",
  },
  {
    name: "AIHub",
    tag: "Intelligence Library",
    desc: "Centralized repository of AI blocks, automation patterns, models and workflows for enterprise deployment.",
    color: "accentPurple",
  },
  {
    name: "GetUpBuilder",
    tag: "Delivery Accelerator",
    desc: "Project generator and accelerator for structured, production-ready software delivery.",
    color: "accentTeal",
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
    icon: "▣",
    title: "Operational Intelligence",
    desc: "Real-time dashboards, data orchestration and decision support layers built on your existing data.",
  },
  {
    icon: "◇",
    title: "Digital Transformation",
    desc: "End-to-end modernization of fragmented operations into scalable, automated digital ecosystems.",
  },
];

export function GlobalHomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <Section className="relative overflow-hidden !py-32 lg:!py-48">
        <div className="absolute inset-0 bg-grid-subtle opacity-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primarySoft/30 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse-soft" />

        <Container className="relative">
          <div className="max-w-4xl">
            <Eyebrow>Enterprise AI Architecture</Eyebrow>
            <h1 className="text-6xl sm:text-7xl lg:text-[80px] font-bold tracking-tight text-text leading-[0.95] mb-8">
              Architectural <span className="italic text-primary">Intelligence</span> for the Modern Enterprise.
            </h1>
            <p className="text-xl sm:text-2xl text-textMuted max-w-2xl leading-relaxed mb-12">
              We design autonomous AI agents, integrated systems and operational intelligence layers that turn fragmented companies into scalable digital ecosystems.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Button to="/contact" className="px-10 py-5">
                Book Strategy Session
              </Button>
              <Button variant="secondary" to="/methodology" className="px-10 py-5">
                Explore Methodology
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-24 grid gap-12 sm:grid-cols-3 pt-12 border-t border-border">
            {[
              { label: "AI Agents", value: "Production-grade" },
              { label: "Integrations", value: "ERP · CRM · BI · APIs" },
              { label: "Infrastructure", value: "Cloud-native" },
            ].map((t) => (
              <div key={t.label}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-textSubtle mb-3">{t.label}</p>
                <p className="text-lg font-bold text-text">{t.value}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Problem Statement */}
      <Section background="surface">
        <Container>
          <div className="max-w-5xl mx-auto text-center">
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold leading-snug tracking-tight text-text mb-8">
              Modern companies operate with <span className="text-primary">fragmented systems</span>, disconnected teams and manual workflows.
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-textMuted">
              GetUpSoft designs the intelligence layer that connects operations, data and decision-making into one scalable architecture.
            </p>
          </div>
        </Container>
      </Section>

      {/* Capabilities */}
      <Section>
        <Container>
          <div className="max-w-2xl mb-20">
            <Eyebrow>Capabilities</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-text">
              Not just tools. <span className="text-primary italic">Systems.</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c) => (
              <article key={c.title} className="p-8 rounded-3xl bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300">
                <div className="text-3xl mb-6 text-primary">{c.icon}</div>
                <h3 className="text-lg font-bold text-text mb-4">{c.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed">{c.desc}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Ecosystem Section */}
      <Section background="surface">
        <Container>
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end mb-16">
            <div className="space-y-4">
              <Eyebrow>Products & Cases</Eyebrow>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-text">
                Our proprietary <span className="italic text-primary">ecosystem.</span>
              </h2>
            </div>
            <Button variant="ghost" to="/products" className="!p-0">
              View Full Portfolio →
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <article
                key={p.name}
                className={`p-10 rounded-[32px] bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300 ${
                  i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textSubtle mb-2">{p.tag}</p>
                    <h3 className="text-3xl font-bold text-text">
                      {p.name}
                    </h3>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse-soft" />
                </div>
                <p className="text-textMuted leading-relaxed mb-8">{p.desc}</p>
                <Button variant="ghost" to="/products" className="!p-0">Explore Case →</Button>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background="primarySoft" className="!py-32">
        <Container>
          <div className="bg-background p-12 sm:p-20 rounded-[56px] shadow-soft-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primarySoft/50 rounded-full blur-[100px] -mt-32" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-bold text-text leading-tight mb-6">
                Ready to architect your <span className="text-primary italic">intelligence layer?</span>
              </h2>
              <p className="text-xl text-textMuted leading-relaxed mb-10">
                We work with enterprise teams, founders and operations leaders who need systems that actually hold together at scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Button to="/contact" className="px-12 py-5">Book Strategy Session</Button>
                <Button variant="outline" to="/ai-agents" className="px-12 py-5">Explore AI Agents</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
