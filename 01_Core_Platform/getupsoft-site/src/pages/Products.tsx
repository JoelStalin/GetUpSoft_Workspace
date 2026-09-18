import { Link } from "react-router-dom";

const offerings = [
  {
    name: "EasyCount by GetUpSoft",
    description:
      "La línea de producto para control operacional, experiencia cliente y flujos conectados con backoffice.",
    href: "/productos/easycount",
  },
  {
    name: "Operational Portals",
    description:
      "Portales privados para equipos internos, clientes o aliados con permisos, segmentación y tareas específicas por rol.",
    href: "/plataforma",
  },
  {
    name: "Integrations & Middleware",
    description:
      "APIs, contratos y automatización entre sistemas para que la operación no dependa de exportar e importar a mano.",
    href: "/plataforma",
  },
  {
    name: "Managed Delivery",
    description:
      "Entornos, despliegue, observabilidad y operación continua para que la solución se mantenga estable en producción.",
    href: "/contacto",
  },
];

export function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <header className="max-w-4xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Productos y capacidades</p>
        <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Una marca corporativa, un producto propio y una capacidad técnica completa.</h1>
        <p className="text-lg leading-8 text-slate-600">
          GetUpSoft no es una página de contabilidad. Es una compañía de software y operación digital. EasyCount es su producto más
          visible, pero la propuesta incluye arquitectura, delivery e integración.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {offerings.map((item) => (
          <article key={item.name} className="rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Offer</p>
            <h2 className="mt-4 text-2xl font-semibold text-ink">{item.name}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{item.description}</p>
            <Link className="mt-8 inline-flex text-sm font-semibold text-accent transition hover:text-ink" to={item.href}>
              Ver más
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
