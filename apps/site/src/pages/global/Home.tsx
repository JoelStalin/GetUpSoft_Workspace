import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { Button } from "../../components/ui/Button";
import { Counter } from "../../components/ui/Counter";
import { HeroCoreAnime } from "../../animations/HeroCoreAnime";
import { useScrollReveal } from "../../animations/useAnimeScroll";

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

const STATS = [
  { label: "Systems Integrated", value: 150, suffix: "+" },
  { label: "AI Agents Live", value: 45, suffix: "" },
  { label: "Ops Optimized", value: 92, suffix: "%" },
];

export function GlobalHomePage() {
  const capRef = useScrollReveal<HTMLDivElement>({ childSelector: ".cap-card" });
  const prodRef = useScrollReveal<HTMLDivElement>({ childSelector: ".prod-card" });

  return (
    <div className="bg-background relative">
      {/* ── HERO (Galante's Inspired: Centered, Massive, Immersive) ── */}
      <Section background="transparent" className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-border">
        {/* Subtle grid and ambient light */}
        <div className="absolute inset-0 bg-grid-subtle opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primarySoft/20 rounded-full blur-[160px] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <div className="animate-fade-in-slow space-y-12">
            <Eyebrow className="justify-center">Architecting the Modern Enterprise</Eyebrow>
            
            <h1 className="text-7xl md:text-8xl lg:text-[120px] font-bold tracking-tight text-text leading-[0.9] max-w-6xl mx-auto">
              Scalability and <span className="italic text-primary">Intelligence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-textMuted max-w-3xl mx-auto leading-relaxed font-medium">
              We design autonomous AI agents, integrated systems and operational intelligence layers that turn fragmented companies into scalable digital ecosystems.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button to="/es/contact" className="!px-12 !py-5 !text-xs shadow-soft-2xl hover:scale-105 transition-all">
                Book Strategy Session
              </Button>
              <Button variant="secondary" to="/es/methodology" className="!px-12 !py-5 !text-xs hover:scale-105 transition-all">
                Explore Methodology
              </Button>
            </div>
          </div>
        </Container>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-float">
           <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </Section>

      {/* ── STATS (Explorium Style: Dynamic Counters) ── */}
      <div className="bg-surface py-12 border-y border-border">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-5xl font-bold text-text">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-textSubtle">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ── CORE VISUAL ── */}
      <Section>
        <Container>
           <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-8">
                 <Eyebrow color="accentPurple">Intelligence Hub</Eyebrow>
                 <h2 className="text-5xl font-bold text-text leading-tight">
                    The single layer for <br /> all your <span className="text-primary italic">operations</span>.
                 </h2>
                 <p className="text-lg text-textMuted leading-relaxed">
                    Break down silos. Connect your ERP to your CRM, and your data to autonomous AI agents that act on your behalf. We build the connective tissue for the enterprise.
                 </p>
                 <div className="pt-6">
                    <Button variant="ghost" to="/es/solutions">See Solutions</Button>
                 </div>
              </div>
              <div className="relative p-10 bg-surface rounded-[48px] border border-border shadow-soft-xl">
                 <HeroCoreAnime />
              </div>
           </div>
        </Container>
      </Section>

      {/* ── ECOSYSTEM ── */}
      <Section background="surface">
        <Container>
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end mb-20">
            <div className="space-y-4">
              <Eyebrow>Products & Cases</Eyebrow>
              <h2 className="text-5xl font-bold tracking-tight text-text">
                Proprietary <span className="italic text-primary">Technology.</span>
              </h2>
            </div>
            <Button variant="ghost" to="/es/products" className="!p-0">
              View All Products
            </Button>
          </div>

          <div ref={prodRef} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <article
                key={p.name}
                className={`prod-card p-12 rounded-[40px] bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl hover:-translate-y-2 transition-all duration-500 group ${
                  i === 0 ? "lg:col-span-2" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-textSubtle mb-3">{p.tag}</p>
                    <h3 className="text-4xl font-bold text-text group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <div className="h-4 w-4 rounded-full bg-primary animate-pulse-soft" />
                </div>
                <p className="text-lg text-textMuted leading-relaxed mb-10">{p.desc}</p>
                <Button variant="ghost" to="/es/products" className="!p-0">Explore Platform</Button>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── CONVERSION ── */}
      <Section background="primarySoft" className="!py-32">
        <Container>
          <div className="bg-text p-16 sm:p-24 rounded-[64px] shadow-soft-2xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accentTeal/10 rounded-full blur-[80px] -ml-32 -mb-32" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Ready to architect your <span className="text-primarySoft italic">intelligence layer?</span>
              </h2>
              <p className="text-xl text-white/60 leading-relaxed">
                Join the organizations leading the transition to autonomous business operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <Button to="/es/contact" className="!bg-white !text-text !px-12 !py-5 hover:!bg-primarySoft transition-all">Book Strategy Session</Button>
                <Button variant="outline" to="/es/ai-agents" className="!border-white/20 !text-white !px-12 !py-5 hover:!bg-white/10 transition-all">Explore AI Agents</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
