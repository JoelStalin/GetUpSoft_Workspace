import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Button } from "../components/ui/Button";

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
    <div className="bg-background">
      <Section className="!py-20 lg:!py-32">
        <Container>
          <div className="max-w-4xl space-y-6">
            <Eyebrow>Contacto</Eyebrow>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-text">
              Conversemos si el problema es <span className="text-primary italic">operativo, técnico o ambos.</span>
            </h1>
            <p className="text-xl text-textMuted leading-relaxed max-w-2xl">
              GetUpSoft trabaja mejor cuando el objetivo es construir una base operativa real: producto, integración, infraestructura y
              automatización con una sola línea de decisión estratégica.
            </p>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {channels.map((item) => (
              <article key={item.title} className="rounded-3xl border border-border bg-background p-8 shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300">
                <h2 className="text-2xl font-bold text-text mb-4">{item.title}</h2>
                <p className="text-textMuted leading-relaxed">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-20 rounded-[40px] border border-border bg-surface p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-text">Direct Inquiry</h2>
                <p className="text-textMuted">Send us a message and our team will get back to you within 24 hours.</p>
                <div className="pt-4 space-y-4">
                  <p className="text-lg font-semibold text-text">contact@getupsoft.com</p>
                  <p className="text-lg font-semibold text-text">+1 (234) 567-890</p>
                </div>
                <Button className="mt-4">Send Message</Button>
              </div>
              <div className="space-y-8">
                <Eyebrow color="accentTeal">Accesos actuales</Eyebrow>
                <div className="grid gap-4 sm:grid-cols-2">
                  <a className="rounded-2xl border border-border bg-background px-6 py-5 transition hover:border-primary hover:text-primary shadow-sm font-bold text-xs uppercase tracking-widest text-textSubtle" href="https://admin.getupsoft.com.do/login">
                    Portal Admin
                  </a>
                  <a className="rounded-2xl border border-border bg-background px-6 py-5 transition hover:border-primary hover:text-primary shadow-sm font-bold text-xs uppercase tracking-widest text-textSubtle" href="https://cliente.getupsoft.com.do/login">
                    EasyCount
                  </a>
                  <a className="rounded-2xl border border-border bg-background px-6 py-5 transition hover:border-primary hover:text-primary shadow-sm font-bold text-xs uppercase tracking-widest text-textSubtle" href="https://socios.getupsoft.com.do/login">
                    Portal Socios
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
