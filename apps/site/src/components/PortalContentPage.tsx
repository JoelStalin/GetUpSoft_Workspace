import { Link } from "react-router-dom";

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
  const accent = theme === "rd" ? "text-accent-rd" : "text-accent-global";
  const bgAccent = theme === "rd" ? "bg-accent-rd" : "bg-accent-global";
  const borderAccent = theme === "rd" ? "border-accent-rd" : "border-accent-global";
  const ctaText = "text-bg-deep";

  return (
    <div className="relative overflow-hidden">
      <section className="border-b border-border-subtle">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="space-y-8">
            <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.4em] ${accent}`}>
              {theme === "rd" ? "// GetUpSoft RD" : "// GetUpSoft Global"}
            </p>
            <h1 className="font-display text-5xl font-light leading-tight tracking-tight text-text-main sm:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-lg font-light leading-relaxed text-text-muted">{subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={primaryTo}
                className={`rounded-full ${bgAccent} px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] ${ctaText} transition hover:scale-105 hover:bg-white`}
              >
                {primaryCta}
              </Link>
              {secondaryCta && secondaryTo ? (
                <Link
                  to={secondaryTo}
                  className={`rounded-full border ${borderAccent}/50 px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] ${accent} transition hover:bg-white hover:text-bg-deep`}
                >
                  {secondaryCta}
                </Link>
              ) : null}
            </div>
          </div>
          <ArchitecturePanel theme={theme} title={title} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {blocks.map((block) => (
            <article key={block.title} className="card-hover glass rounded-3xl p-8">
              <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.25em] ${accent}`}>{block.eyebrow}</p>
              <h2 className="mt-4 font-display text-2xl font-semibold text-text-main">{block.title}</h2>
              <p className="mt-4 text-sm font-light leading-7 text-text-muted">{block.body}</p>
              <ul className="mt-6 space-y-3">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-text-soft">
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${bgAccent}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border-subtle bg-bg-surface/30">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className={`text-center font-mono text-[10px] font-bold uppercase tracking-[0.4em] ${accent}`}>FAQ</p>
          <div className="mt-12 divide-y divide-border-subtle rounded-3xl border border-border-subtle bg-bg-elevated/40">
            {faq.map((item) => (
              <details key={item.q} className="group p-7">
                <summary className="cursor-pointer list-none font-display text-xl font-medium text-text-main">
                  {item.q}
                </summary>
                <p className="mt-4 max-w-3xl text-sm font-light leading-7 text-text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="glass rounded-4xl p-10 text-center sm:p-16">
          <h2 className="font-display text-4xl font-light tracking-tight text-text-main">
            {theme === "rd" ? "Construyamos una operación más estable." : "Build the next layer of your enterprise architecture."}
          </h2>
          <Link
            to={primaryTo}
            className={`mt-8 inline-flex rounded-full ${bgAccent} px-8 py-4 text-[12px] font-bold uppercase tracking-[0.2em] ${ctaText} transition hover:scale-105 hover:bg-white`}
          >
            {primaryCta}
          </Link>
        </div>
      </section>
    </div>
  );
}

function ArchitecturePanel({ theme, title }: { theme: "global" | "rd"; title: string }) {
  const accent = theme === "rd" ? "#99F6E4" : "#A5B4FC";
  const second = theme === "rd" ? "#A5B4FC" : "#67E8F9";
  return (
    <div className="glass relative min-h-[360px] overflow-hidden rounded-[2rem] p-8">
      <div className="absolute inset-0 opacity-80">
        <svg viewBox="0 0 720 520" className="h-full w-full" role="img" aria-label={`${title} architecture visual`}>
          <defs>
            <radialGradient id={`g-${theme}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0F1115" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="720" height="520" fill={`url(#g-${theme})`} />
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={i}
              d={`M${90 + i * 38} ${390 - i * 36} C ${210 + i * 18} ${160 + i * 8}, ${380 - i * 18} ${430 - i * 22}, ${610 - i * 34} ${120 + i * 42}`}
              fill="none"
              stroke={i % 2 ? second : accent}
              strokeOpacity="0.38"
              strokeWidth="1.5"
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
              <rect x={x} y={y} width="110" height="56" rx="12" fill="#161920" stroke={i % 2 ? second : accent} strokeOpacity="0.55" />
              <circle cx={x + 24} cy={y + 28} r="6" fill={i % 2 ? second : accent} />
              <path d={`M${x + 42} ${y + 22}h42M${x + 42} ${y + 34}h28`} stroke="#E2E8F0" strokeOpacity="0.35" strokeWidth="2" />
            </g>
          ))}
          <circle cx="360" cy="240" r="52" fill="#0F1115" stroke={accent} strokeOpacity="0.8" />
          <circle cx="360" cy="240" r="16" fill={accent} />
        </svg>
      </div>
      <div className="relative flex h-full min-h-[300px] flex-col justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-text-muted">Architecture Map</p>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-soft">Connected systems</p>
          <p className="mt-3 max-w-sm text-sm font-light leading-7 text-text-muted">
            Visual layer for systems, data, infrastructure and operational workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
