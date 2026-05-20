import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Button } from "../components/ui/Button";

const capabilities = [
  {
    icon: "◈",
    title: "AI Strategy & Agents",
    description: "We architect autonomous agents that handle document processing, scheduling, and operational analytics.",
    color: "accentPurple",
  },
  {
    icon: "⬡",
    title: "System Integration",
    description: "Seamlessly connect Odoo, ERPNext, SAP and legacy infrastructure through robust API layers.",
    color: "primary",
  },
  {
    icon: "▣",
    title: "Digital Infrastructure",
    description: "Cloud-native deployment with precision monitoring, security hardening and global scalability.",
    color: "accentTeal",
  },
];

const methodology = [
  { step: "01", title: "Architecture Audit", description: "Mapping systems, data flows and operational bottlenecks." },
  { step: "02", title: "Intelligence Design", description: "Engineering the target state with AI and integrated ERPs." },
  { step: "03", title: "Operational Delivery", description: "Development and deployment with industrial discipline." },
  { step: "04", title: "Scale & Support", description: "Continuous improvement and long-term technical partnership." },
];

export function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <Section className="relative overflow-hidden !py-32 lg:!py-48">
        {/* Aesthetic backgrounds */}
        <div className="absolute inset-0 bg-grid-subtle opacity-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primarySoft/30 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accentPurpleSoft/20 rounded-full blur-[100px] -ml-24 -mb-24" />

        <Container className="relative">
          <div className="max-w-4xl">
            <Eyebrow>Enterprise AI Architecture</Eyebrow>
            <h1 className="text-6xl sm:text-7xl lg:text-[80px] font-bold tracking-tight text-text leading-[0.95] mb-8">
              Scalability and <span className="italic text-primary">intelligence</span> for the modern enterprise.
            </h1>
            <p className="text-xl sm:text-2xl text-textMuted max-w-2xl leading-relaxed mb-12">
              GetUpSoft architects, integrates and automates complex digital ecosystems using autonomous AI agents, ERP integrations and scalable cloud infrastructure.
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

          {/* Trust Bar */}
          <div className="mt-24 pt-10 border-t border-border">
            <p className="text-[11px] font-bold uppercase tracking-widest text-textSubtle mb-8">
              Propelling intelligence across:
            </p>
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm font-semibold text-textMuted/60 uppercase tracking-wider">
              <span>AI Agents</span>
              <span>ERP Integrations</span>
              <span>Cloud Infrastructure</span>
              <span>Operational Intelligence</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Capabilities Grid */}
      <Section background="surface">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <Eyebrow color="accentTeal">Capacidades</Eyebrow>
              <h2 className="text-4xl sm:text-5xl font-bold text-text leading-tight mb-6">
                Complete digital <br /> transformation.
              </h2>
              <p className="text-lg text-textMuted leading-relaxed">
                Everything you need to build, deploy, and scale your digital operations as a single, connected engine.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
              {capabilities.map((cap) => (
                <div key={cap.title} className="p-8 rounded-3xl bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300">
                  <div className={`text-4xl mb-6 text-primary`}>{cap.icon}</div>
                  <h3 className="text-xl font-bold text-text mb-4">{cap.title}</h3>
                  <p className="text-textMuted leading-relaxed">{cap.description}</p>
                </div>
              ))}
              <div className="p-8 rounded-3xl bg-primary flex flex-col justify-between text-white shadow-soft-xl">
                <div>
                  <h3 className="text-xl font-bold mb-4">Integration Layer</h3>
                  <p className="text-white/80 leading-relaxed">Connect Odoo, ERPNext, SAP and custom APIs with absolute precision.</p>
                </div>
                <Button variant="ghost" to="/integrations" className="!p-0 !text-white hover:!bg-transparent mt-8 self-start">
                  View Connectors →
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Methodology Section */}
      <Section>
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Eyebrow>Methodology</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold text-text mb-8">
              A clear path to <span className="text-primary italic">operational clarity</span>.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {methodology.map((step) => (
              <div key={step.step} className="relative p-8 group">
                <div className="text-6xl font-bold text-surfaceSoft mb-6 transition-colors group-hover:text-primarySoft">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-text mb-4">{step.title}</h3>
                <p className="text-textMuted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section background="primarySoft" className="!py-24">
        <Container>
          <div className="bg-background p-12 sm:p-20 rounded-[48px] shadow-soft-2xl flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accentTealSoft/30 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-bold text-text mb-6">
                Ready to architect your <span className="italic text-primary">intelligence</span> layer?
              </h2>
              <p className="text-lg text-textMuted leading-relaxed">
                Connect with our team of architects to evaluate your systems and design a roadmap for scalable, automated operations.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Button to="/contact" className="px-12 py-5">Get Started</Button>
              <Button variant="outline" to="/about" className="px-12 py-5">Learn More</Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
