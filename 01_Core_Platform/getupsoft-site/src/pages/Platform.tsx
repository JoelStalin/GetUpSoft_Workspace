const layers = [
  {
    title: "Experience layer",
    description:
      "Interfaces claras para admin, clientes, aliados y operadores. Cada superficie resuelve un trabajo distinto y evita mezclar contextos.",
  },
  {
    title: "System layer",
    description:
      "Servicios, integraciones, colas y contratos que conectan procesos de negocio con producto y fuentes externas.",
  },
  {
    title: "Delivery layer",
    description:
      "Entornos, despliegues, monitoreo, rutas de rollback y propiedad operacional definida desde el primer release.",
  },
];

const principles = [
  "Separación clara entre marca corporativa y superficie de producto.",
  "Portales por rol, no una sola interfaz para todo el negocio.",
  "Infraestructura y delivery como parte del producto, no como tarea posterior.",
  "Automatización sobre procesos reales, no sobre workflows imaginarios.",
];

export function PlatformPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <header className="grid gap-10 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Plataforma</p>
          <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Arquitectura pensada para operar, integrar y escalar.</h1>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Diseñamos la plataforma como un sistema de capas. La interfaz no va por un lado y la operación por otro. Producto,
          integración e infraestructura se resuelven juntos para que el negocio no se fracture al crecer.
        </p>
      </header>

      <section className="mt-14 grid gap-6 lg:grid-cols-3">
        {layers.map((layer) => (
          <article key={layer.title} className="rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{layer.title}</p>
            <p className="mt-4 text-xl font-semibold text-ink">{layer.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-10 border-t border-slate-200 pt-12 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Principios</p>
          <h2 className="text-3xl font-semibold text-ink">Lo que mantenemos fijo aunque cambie el stack.</h2>
        </div>
        <div className="grid gap-4">
          {principles.map((item) => (
            <div key={item} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
              <p className="text-base leading-7 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
