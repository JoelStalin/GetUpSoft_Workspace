import { Link } from "react-router-dom";

const proof = [
  { label: "Software", value: "Operating product surfaces" },
  { label: "Infrastructure", value: "Automated delivery & scale" },
  { label: "Automation", value: "Business logic orchestration" },
];

const capabilities = [
  {
    name: "Product Platforms",
    description:
      "Admin portals, client surfaces and multi-tenant experiences designed for real work, not empty demos.",
  },
  {
    name: "Business Workflows",
    description:
      "Processes that cross sales, operations, support and backoffice without depending on manual tasks.",
  },
  {
    name: "Cloud Delivery",
    description:
      "Infrastructure, deployments, monitoring and environment controls for scaling teams.",
  },
  {
    name: "Integration Layer",
    description:
      "Connectors and middleware for Odoo, billing, catalogs and business events with clear contracts.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Mapping Operations",
    description:
      "We identify where handoffs break between people and systems before proposing any UI.",
  },
  {
    step: "02",
    title: "System Architecture",
    description:
      "We design product, integrations and automation as a single unit with technical ownership.",
  },
  {
    step: "03",
    title: "Operational Delivery",
    description:
      "Delivery with environments, observability and a codebase ready for scale.",
  },
];

export function HomePage() {
  return (
    <div className="relative overflow-hidden bg-canvas">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern [background-size:40px_40px] opacity-20" />
      <div className="animate-glow-slow pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      <div className="animate-glow-slow pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-accent-pink/10 blur-[120px]" />

      <section className="relative border-b border-white/5">
        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:py-20">
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="font-mono inline-flex items-center rounded-sm border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                System Status: Active
              </span>
              <div className="space-y-6">
                <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-8xl">
                  OPERATING <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-purple to-accent-pink">
                    INTELLECT.
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
                  GetUpSoft engineers digital operating systems for teams that need to scale. 
                  High-fidelity software, automated infrastructure, and business logic orchestration.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                className="group relative overflow-hidden rounded-sm bg-accent px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
                to="/productos/easycount"
              >
                <span className="relative z-10">Deploy EasyCount</span>
              </Link>
              <Link
                className="rounded-sm border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
                to="/plataforma"
              >
                Explore Platform
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {proof.map((item) => (
                <div key={item.label} className="border-l border-white/10 pl-6">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-300">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass relative overflow-hidden rounded-lg border border-white/20 bg-slate-950/40 p-1 shadow-2xl">
              <div className="rounded-md bg-slate-950 px-6 py-8 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Terminal Instance</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">System Delivery Model</p>
                  </div>
                  <div className="flex h-3 w-3 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>

                <div className="mt-8 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Workflows</p>
                      <div className="space-y-3">
                        {["Admin Surface", "Auth Logic", "API Gateway"].map((tool) => (
                          <div key={tool} className="flex items-center gap-3 rounded-md bg-white/5 px-4 py-3 text-xs font-medium border border-white/5">
                            <div className="h-1 w-1 rounded-full bg-accent" />
                            {tool}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {[
                        ["Env", "Production"],
                        ["Uptime", "99.99%"],
                        ["Latency", "42ms"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex flex-col justify-center rounded-lg border border-white/5 bg-white/[0.02] p-5">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</p>
                          <p className="mt-1 text-lg font-bold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex gap-2">
                      <div className="h-2 flex-1 rounded-full bg-accent" />
                      <div className="h-2 flex-1 rounded-full bg-accent-purple opacity-50" />
                      <div className="h-2 flex-1 rounded-full bg-accent-pink opacity-30" />
                    </div>
                    <p className="mt-4 font-mono text-[10px] text-white/40 uppercase tracking-widest">
                      Resource Allocation Optimized
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Capabilities</p>
          <h2 className="text-4xl font-bold text-ink sm:text-6xl">Not just code. Systems.</h2>
          <p className="text-xl leading-relaxed text-slate-400">
            We don't sell interfaces. We design the technical infrastructure that makes them work reliably at any scale.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {capabilities.map((item) => (
            <article key={item.name} className="glass group rounded-xl p-8 transition hover:border-accent/40">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent/60 group-hover:text-accent">
                {item.name}
              </p>
              <p className="mt-6 text-xl font-medium leading-relaxed text-slate-200">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.01] backdrop-blur-3xl">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-[0.8fr,1.2fr]">
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent-pink">Operation</p>
              <h2 className="text-4xl font-bold text-ink sm:text-5xl">Clean Handoffs. <br /> Zero Noise.</h2>
            </div>
            <div className="space-y-12">
              {workflow.map((item) => (
                <article key={item.step} className="grid gap-6 md:grid-cols-[100px,1fr]">
                  <p className="font-mono text-3xl font-bold text-white/10">{item.step}</p>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-ink">{item.title}</h3>
                    <p className="max-w-2xl text-lg leading-relaxed text-slate-400">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="glass rounded-[40px] border-white/10 bg-slate-900/40 p-12 lg:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Core Product</p>
                <h2 className="text-4xl font-bold text-ink sm:text-6xl">EasyCount</h2>
                <p className="text-xl leading-relaxed text-slate-400">
                  EasyCount is our operating line for business control, billing, and connected workflows. 
                  Built on top of the GetUpSoft core architecture.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  "Role-specific operating surfaces",
                  "Native business event orchestration",
                  "Traceable operational workflows",
                  "Built for industrial-grade scale",
                ].map((line) => (
                  <div key={line} className="flex items-center gap-4 text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <p className="text-lg font-medium">{line}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link className="rounded-sm bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink transition hover:bg-slate-200" to="/productos/easycount">
                  Access Specs
                </Link>
                <Link
                  className="rounded-sm border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
                  to="/contacto"
                >
                  Request Demo
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="aspect-square rounded-full border border-white/5 bg-gradient-to-br from-accent/20 to-accent-pink/5 flex items-center justify-center relative">
                 <div className="absolute inset-20 rounded-full border border-white/10 animate-spin [animation-duration:20s]" />
                 <div className="absolute inset-40 rounded-full border border-accent/20 animate-spin [animation-duration:15s] [animation-direction:reverse]" />
                 <div className="h-32 w-32 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/20 shadow-2xl relative z-10">
                    <span className="font-bold text-4xl tracking-tighter italic">EC</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
