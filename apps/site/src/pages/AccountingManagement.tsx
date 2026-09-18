import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Button } from "../components/ui/Button";

const features = [
  "Portales por rol para operación interna, clientes y aliados.",
  "Automatización de tareas operativas que hoy dependen de seguimiento manual.",
  "Integraciones y middleware para conectar producto, backoffice y flujos externos.",
  "Base preparada para trazabilidad, control comercial y trabajo conectado.",
];

const useCases = [
  "Equipos que ya no quieren operar desde un mosaico de hojas, chats y tareas sueltas.",
  "Organizaciones que necesitan una experiencia cliente clara, pero con backend serio detrás.",
  "Empresas que deben coordinar portales, integración y delivery sin fragmentar ownership técnico.",
];

export function AccountingManagementPage() {
  return (
    <div className="bg-background">
      <Section className="!py-20 lg:!py-32 border-b border-border">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.1fr,0.9fr] items-end">
            <div className="space-y-6">
              <Eyebrow color="accentTeal">EasyCount by GetUpSoft</Eyebrow>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-text">
                El producto para <span className="text-primary italic">control operacional</span> y trabajo conectado.
              </h1>
              <p className="text-xl text-textMuted leading-relaxed max-w-2xl">
                EasyCount no es solo un módulo contable. Es la línea de producto donde GetUpSoft empaqueta experiencia cliente, operación
                administrativa, automatización y trazabilidad.
              </p>
            </div>

            <div className="p-10 rounded-[40px] bg-surface border border-border shadow-soft-xl">
              <Eyebrow color="primary">Capacidades</Eyebrow>
              <ul className="mt-8 space-y-5">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-4 text-lg font-medium text-textMuted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="surface">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item} className="p-10 rounded-[32px] bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300">
                <p className="text-lg font-medium text-textMuted leading-relaxed">{item}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="primarySoft" className="!py-24">
        <Container>
          <div className="bg-background p-12 sm:p-20 rounded-[56px] shadow-soft-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accentTealSoft/30 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <Eyebrow color="accentTeal">Siguiente paso</Eyebrow>
              <h2 className="text-4xl sm:text-5xl font-bold text-text leading-tight max-w-3xl mb-12">
                Si necesitas producto y operación en la misma conversación, EasyCount entra como pieza de una arquitectura mayor.
              </h2>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button href="https://cliente.getupsoft.com.do/login" className="px-10 py-5">Ver acceso cliente</Button>
                <Button variant="outline" href="https://admin.getupsoft.com.do/login" className="px-10 py-5">Ver acceso admin</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
