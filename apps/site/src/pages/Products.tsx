import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Button } from "../components/ui/Button";

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
    href: "/platform",
  },
  {
    name: "Integrations & Middleware",
    description:
      "APIs, contratos y automatización entre sistemas para que la operación no dependa de exportar e importar a mano.",
    href: "/system-integration",
  },
  {
    name: "Managed Delivery",
    description:
      "Entornos, despliegue, observabilidad y operación continua para que la solución se mantenga estable en producción.",
    href: "/contact",
  },
];

export function ProductsPage() {
  return (
    <div className="bg-background">
      <Section className="!py-20 lg:!py-32 border-b border-border">
        <Container>
          <div className="max-w-4xl space-y-6">
            <Eyebrow>Productos y capacidades</Eyebrow>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-text">
              Una marca corporativa, un <span className="text-primary italic">producto propio</span> y una capacidad técnica completa.
            </h1>
            <p className="text-xl text-textMuted leading-relaxed max-w-2xl">
              GetUpSoft no es una página de contabilidad. Es una compañía de software y operación digital. EasyCount es su producto más
              visible, pero la propuesta incluye arquitectura, delivery e integración.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="surface">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {offerings.map((item) => (
              <article key={item.name} className="p-10 rounded-[32px] bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <Eyebrow color="accentTeal" className="mb-4">Offer</Eyebrow>
                  <h2 className="text-3xl font-bold text-text mb-6">{item.name}</h2>
                  <p className="text-lg text-textMuted leading-relaxed">{item.description}</p>
                </div>
                <Button variant="ghost" to={item.href} className="!p-0 mt-10">
                  Ver más →
                </Button>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
