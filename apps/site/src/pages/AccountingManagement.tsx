const features = [
  "Portales por rol para operación interna, clientes y aliados.",
  "Automatización de tareas operativas que hoy dependen de seguimiento manual.",
  "Integraciones y middleware para conectar producto, backoffice y flujos externos.",
  "Base preparada para trazabilidad, control comercial y trabajo conectado con sistemas de negocio.",
];

const useCases = [
  "Equipos que ya no quieren operar desde un mosaico de hojas, chats y tareas sueltas.",
  "Organizaciones que necesitan una experiencia cliente clara, pero con backend serio detrás.",
  "Empresas que deben coordinar portales, integración y delivery sin fragmentar ownership técnico.",
];

export function AccountingManagementPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <header className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">EasyCount by GetUpSoft</p>
          <h1 className="text-4xl font-semibold text-ink sm:text-5xl">El producto de GetUpSoft para control operacional y trabajo conectado.</h1>
          <p className="text-lg leading-8 text-slate-600">
            EasyCount no es solo un módulo contable. Es la línea de producto donde GetUpSoft empaqueta experiencia cliente, operación
            administrativa, automatización y trazabilidad dentro de una misma superficie operable.
          </p>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Incluye</p>
          <ul className="mt-5 space-y-4">
            {features.map((feature) => (
              <li key={feature} className="text-base leading-7 text-slate-700">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {useCases.map((item) => (
          <article key={item} className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-base leading-7 text-slate-700">{item}</p>
          </article>
        ))}
      </section>

      <section className="mt-14 rounded-[28px] border border-slate-200 bg-slate-950 px-8 py-10 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Siguiente paso</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold">
          Si necesitas producto y operación en la misma conversación, EasyCount entra como pieza de una arquitectura mayor.
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100" href="https://cliente.getupsoft.com.do/login">
            Ver acceso cliente
          </a>
          <a
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            href="https://admin.getupsoft.com.do/login"
          >
            Ver acceso admin
          </a>
        </div>
      </section>
    </div>
  );
}
