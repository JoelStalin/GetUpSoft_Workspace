const channels = [
  {
    title: "Arquitectura y producto",
    detail: "Para equipos que necesitan definir una nueva plataforma, rediseñar un portal existente o separar dominios de producto.",
  },
  {
    title: "Infraestructura y delivery",
    detail: "Para despliegue, entornos, observabilidad, dominios, rutas de publicación y operación continua.",
  },
  {
    title: "Automatización e integraciones",
    detail: "Para middleware, sincronización entre sistemas, procesos internos y eliminación de pasos manuales repetitivos.",
  },
];

export function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <header className="max-w-4xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Contacto</p>
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Conversemos si el problema es operativo, técnico o ambos.</h1>
        <p className="text-lg leading-8 text-slate-600">
          GetUpSoft trabaja mejor cuando el objetivo es construir una base operativa real: producto, integración, infraestructura y
          automatización con una sola línea de decisión.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {channels.map((item) => (
          <article key={item.title} className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold text-ink">{item.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </div>

      <section className="mt-14 rounded-[28px] border border-slate-200 bg-slate-950 px-8 py-10 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Accesos actuales</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <a className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10" href="https://admin.getupsoft.com.do/login">
            Portal Admin
          </a>
          <a className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10" href="https://cliente.getupsoft.com.do/login">
            EasyCount
          </a>
          <a className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10" href="https://socios.getupsoft.com.do/login">
            Portal Socios
          </a>
        </div>
      </section>
    </div>
  );
}
