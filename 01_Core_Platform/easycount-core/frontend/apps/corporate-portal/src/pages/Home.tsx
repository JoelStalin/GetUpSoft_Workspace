import { Link } from "react-router-dom";

const metrics = [
  { label: "Portales", value: "3" },
  { label: "Cobertura", value: "Admin, cliente y socios" },
  { label: "Motor", value: "e-CF + DGII + Odoo" },
];

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-20 bg-background text-foreground">
      <section className="grid gap-16 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            Tax-tech Orchestration
          </span>
          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl md:text-6xl font-display font-light leading-tight tracking-tight text-white">
              Gestión fiscal y operativa <span className="italic text-primary">automatizada</span>.
            </h1>
            <p className="max-w-2xl text-lg text-muted font-light leading-relaxed">
              EasyCounting centraliza facturación electrónica, trazabilidad documental y control contable con un enfoque minimalista para República Dominicana.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 items-center pt-4">
            <a className="rounded-full bg-primary px-8 py-4 text-sm font-medium text-bgDeep hover:bg-white transition-all shadow-lg shadow-primary/5" href="https://cliente.getupsoft.com.do/login">
              Solicitar demo
            </a>
            <Link className="text-sm font-medium text-muted hover:text-white transition-colors flex items-center group" to="/productos">
              Explorar productos
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-[2rem] border border-border bg-surface p-8 shadow-2xl shadow-black/50">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border bg-background/50 px-6 py-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{metric.label}</p>
              <p className="mt-2 text-xl font-display font-medium text-white tracking-tight">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-32 grid gap-12 md:grid-cols-3">
        <article className="p-8 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-all">
          <div className="text-[10px] font-mono text-primary mb-6 tracking-widest uppercase">01 / CUMPLIMIENTO</div>
          <p className="text-lg font-medium mb-4 text-white">Fiscalidad Integrada</p>
          <p className="text-sm text-muted leading-relaxed font-light">Flujos preparados para e-CF y reportes orientados a las normativas vigentes de la DGII.</p>
        </article>
        <article className="p-8 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-all">
          <div className="text-[10px] font-mono text-primary mb-6 tracking-widest uppercase">02 / CONTROL</div>
          <p className="text-lg font-medium mb-4 text-white">Arquitectura Multi-Portal</p>
          <p className="text-sm text-muted leading-relaxed font-light">Segregación total por tenant con portales dedicados para administración, clientes y socios.</p>
        </article>
        <article className="p-8 bg-surface rounded-2xl border border-border hover:border-primary/30 transition-all">
          <div className="text-[10px] font-mono text-primary mb-6 tracking-widest uppercase">03 / CONECTIVIDAD</div>
          <p className="text-lg font-medium mb-4 text-white">Ecosistema Odoo</p>
          <p className="text-sm text-muted leading-relaxed font-light">Integración nativa con Odoo para una operación fluida entre ventas, inventario y finanzas.</p>
        </article>
      </section>
    </div>
  );
}
