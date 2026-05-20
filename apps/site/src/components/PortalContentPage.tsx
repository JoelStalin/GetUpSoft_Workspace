import { Link } from "react-router-dom";
import { Section } from "./ui/Section";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";
import { Button } from "./ui/Button";

type PageBlock = {
  eyebrow: string;
  title: string;
  body: string;
  items: string[];
};

type PortalContentPageProps = {
  theme: "global" | "rd";
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryTo: string;
  secondaryCta?: string;
  secondaryTo?: string;
  blocks: PageBlock[];
  faq: Array<{ q: string; a: string }>;
};

export function PortalContentPage({
  theme,
  title,
  subtitle,
  primaryCta,
  primaryTo,
  secondaryCta,
  secondaryTo,
  blocks,
  faq,
}: PortalContentPageProps) {
  const accentColor = theme === "rd" ? "accentTeal" : "primary";

  return (
    <div className="bg-background">
      {/* Hero Header */}
      <Section className="!py-24 lg:!py-36 border-b border-border">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr,1.1fr] items-center">
            <div className="space-y-8">
              <Eyebrow color={accentColor}>
                {theme === "rd" ? "GetUpSoft RD" : "GetUpSoft Global"}
              </Eyebrow>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[1.05]">
                {title}
              </h1>
              <p className="max-w-xl text-xl text-textMuted leading-relaxed">
                {subtitle}
              </p>
              <div className="flex flex-wrap gap-5">
                <Button to={primaryTo} className={theme === "rd" ? "bg-accentTeal hover:bg-text" : ""}>
                  {primaryCta}
                </Button>
                {secondaryCta && secondaryTo && (
                  <Button variant="outline" to={secondaryTo}>
                    {secondaryCta}
                  </Button>
                )}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primarySoft/20 rounded-[40px] blur-3xl group-hover:bg-primarySoft/30 transition-colors" />
              <ArchitecturePanel theme={theme} title={title} />
            </div>
          </div>
        </Container>
      </Section>

      {/* Feature Blocks */}
      <Section background="surface">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            {blocks.map((block) => (
              <article key={block.title} className="p-10 rounded-[32px] bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300">
                <Eyebrow color={accentColor} className="mb-4">{block.eyebrow}</Eyebrow>
                <h2 className="text-2xl font-bold text-text mb-4">{block.title}</h2>
                <p className="text-textMuted leading-relaxed mb-8">{block.body}</p>
                <ul className="space-y-4">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-4 text-sm font-medium text-textMuted">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${theme === "rd" ? "bg-accentTeal" : "bg-primary"}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Eyebrow color={accentColor}>FAQ</Eyebrow>
              <h2 className="text-4xl font-bold text-text">Common Inquiries</h2>
            </div>
            <div className="divide-y divide-border border-t border-border">
              {faq.map((item) => (
                <details key={item.q} className="group py-8">
                  <summary className="cursor-pointer list-none flex items-center justify-between font-bold text-xl text-text hover:text-primary transition-colors">
                    <span>{item.q}</span>
                    <span className="text-2xl font-light group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-6 max-w-3xl text-lg text-textMuted leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Conversion Section */}
      <Section background={theme === "rd" ? "accentTealSoft" : "primarySoft"} className="!py-32">
        <Container>
          <div className="bg-background p-12 sm:p-20 rounded-[56px] shadow-soft-2xl text-center relative overflow-hidden">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 ${theme === "rd" ? "bg-accentTealSoft/50" : "bg-primarySoft/50"} rounded-full blur-[100px] -mt-32`} />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-bold text-text leading-tight mb-10">
                {theme === "rd"
                  ? "Construyamos una operación más estable."
                  : "Build the next layer of your enterprise architecture."}
              </h2>
              <Button to={primaryTo} className={`px-12 py-5 ${theme === "rd" ? "bg-accentTeal hover:bg-text" : ""}`}>
                {primaryCta}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

function ArchitecturePanel({ theme, title }: { theme: "global" | "rd"; title: string }) {
  const accent = theme === "rd" ? "#14B8A6" : "#3B82F6";
  const second = theme === "rd" ? "#8B5CF6" : "#06B6D4";
  return (
    <div className="relative bg-background/40 backdrop-blur-sm border border-borderStrong/20 min-h-[420px] overflow-hidden rounded-[40px] p-10 flex flex-col justify-between shadow-soft-xl">
      <div className="absolute inset-0 opacity-40">
        <svg viewBox="0 0 720 520" className="h-full w-full" role="img" aria-label={`${title} architecture visual`}>
          <defs>
            <radialGradient id={`g-${theme}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="720" height="520" fill={`url(#g-${theme})`} />
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={i}
              d={`M${90 + i * 38} ${390 - i * 36} C ${210 + i * 18} ${160 + i * 8}, ${380 - i * 18} ${430 - i * 22}, ${610 - i * 34} ${120 + i * 42}`}
              fill="none"
              stroke={i % 2 ? second : accent}
              strokeOpacity="0.25"
              strokeWidth="1.2"
            />
          ))}
          {[
            [150, 150],
            [300, 95],
            [470, 150],
            [210, 315],
            [390, 300],
            [540, 360],
          ].map(([x, y], i) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width="110" height="56" rx="16" fill="#FFFFFF" stroke={i % 2 ? second : accent} strokeOpacity="0.4" strokeWidth="1" />
              <circle cx={x + 24} cy={y + 28} r="5" fill={i % 2 ? second : accent} fillOpacity="0.6" />
              <path d={`M${x + 42} ${y + 22}h42M${x + 42} ${y + 34}h28`} stroke="#94A3B8" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
          <circle cx="360" cy="240" r="52" fill="#FFFFFF" stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
          <circle cx="360" cy="240" r="14" fill={accent} fillOpacity="0.7" />
        </svg>
      </div>
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-textSubtle mb-2">Architecture Map</p>
        <p className="text-xl font-bold text-text">Operational Core</p>
      </div>
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-textSubtle mb-3">System Mesh</p>
        <p className="max-w-xs text-sm text-textMuted leading-relaxed font-medium">
          Unified governance for AI agents, ERP endpoints and cloud infrastructure.
        </p>
      </div>
    </div>
  );
}
