import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";

const layers = [
  {
    title: "Experience layer",
    description:
      "Interfaces claras para admin, clientes, aliados y operadores. Cada superficie resuelve un trabajo distinto.",
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
  "Infraestructura y delivery como parte del producto.",
  "Automatización sobre procesos reales.",
];

export function PlatformPage() {
  return (
    <div className="bg-background">
      <Section className="!py-20 lg:!py-32 border-b border-border">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr,1.1fr] items-center">
            <div className="space-y-6">
              <Eyebrow>Plataforma</Eyebrow>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-text">
                Arquitectura pensada para <span className="text-primary italic">operar, integrar y escalar.</span>
              </h1>
            </div>
            <p className="max-w-2xl text-xl text-textMuted leading-relaxed">
              Diseñamos la plataforma como un sistema de capas. La interfaz no va por un lado y la operación por otro. Producto,
              integración e infraestructura se resuelven juntos.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="surface">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            {layers.map((layer) => (
              <article key={layer.title} className="p-10 rounded-[32px] bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300">
                <Eyebrow color="accentPurple" className="mb-4">{layer.title}</Eyebrow>
                <p className="text-xl font-bold text-text leading-snug">{layer.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-16 lg:grid-cols-[0.9fr,1.1fr]">
            <div className="space-y-6">
              <Eyebrow color="accentTeal">Principios</Eyebrow>
              <h2 className="text-4xl font-bold text-text">Lo que mantenemos fijo aunque cambie el stack.</h2>
            </div>
            <div className="grid gap-6">
              {principles.map((item) => (
                <div key={item} className="p-6 rounded-2xl bg-surface border border-border">
                  <p className="text-lg font-medium text-textMuted leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
