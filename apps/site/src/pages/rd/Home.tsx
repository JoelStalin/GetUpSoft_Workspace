import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { Button } from "../../components/ui/Button";

const SERVICES = [
  {
    icon: "◈",
    title: "Odoo ERP",
    desc: "Implementación completa de Odoo para ventas, inventario, contabilidad, CRM y facturación.",
    to: "/odoo-erp",
  },
  {
    icon: "◎",
    title: "Facturación Electrónica",
    desc: "e-CF conforme a DGII. Emisión, validación y reportes integrados con tu sistema de gestión.",
    to: "/facturacion-electronica",
  },
  {
    icon: "⬡",
    title: "Infraestructura",
    desc: "Servidores, cableado estructurado, racks, WiFi empresarial y continuidad operativa.",
    to: "/infraestructura",
  },
  {
    icon: "▣",
    title: "Redes Empresariales",
    desc: "Diseño e instalación de redes LAN/WiFi para oficinas, almacenes y sucursales.",
    to: "/redes-empresariales",
  },
];

const SECTORS = [
  "Distribuidoras y almacenes",
  "Retail y comercios",
  "Ferreterías",
  "Restaurantes y food-tech",
  "Logística y transporte",
  "Servicios profesionales",
];

const PROBLEMS = [
  "Inventario difícil de controlar",
  "Facturación manual sin cumplimiento DGII",
  "Sistemas desconectados entre áreas",
  "Redes inestables que interrumpen la operación",
  "Sin visibilidad en tiempo real del negocio",
];

export function RDHomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <Section className="relative overflow-hidden !py-32 lg:!py-48">
        <div className="absolute inset-0 bg-grid-subtle opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accentTealSoft/40 rounded-full blur-[100px] -mr-32 -mt-32" />

        <Container className="relative">
          <div className="max-w-4xl">
            <Eyebrow color="accentTeal">Soluciones Tangibles · Software + Hardware</Eyebrow>
            <h1 className="text-6xl sm:text-7xl lg:text-[80px] font-bold tracking-tight text-text leading-[0.95] mb-8">
              Infraestructura y <span className="italic text-accentTeal">gestión</span> para el éxito local.
            </h1>
            <p className="text-xl sm:text-2xl text-textMuted max-w-2xl leading-relaxed mb-12">
              Implementamos Odoo ERP, facturación electrónica DGII e infraestructura empresarial para que tu operación fluya sin interrupciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Button to="/contacto" className="bg-accentTeal px-10 py-5 hover:bg-text">
                Solicitar Diagnóstico
              </Button>
              <Button variant="secondary" to="/servicios" className="bg-accentTealSoft text-accentTeal hover:bg-accentTeal hover:text-white px-10 py-5">
                Ver Servicios
              </Button>
            </div>
          </div>

          {/* Trust Bar */}
          <div className="mt-24 pt-10 border-t border-border">
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm font-semibold text-textMuted/60 uppercase tracking-wider">
              <span>Odoo ERP</span>
              <span>DGII · e-CF</span>
              <span>Redes Empresariales</span>
              <span>Soporte Local RD</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Problem Statement */}
      <Section background="surface">
        <Container>
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Eyebrow color="accentTeal">El Problema</Eyebrow>
              <h2 className="text-4xl sm:text-5xl font-bold text-text leading-tight mb-8">
                Muchas empresas operan con <span className="italic text-accentTeal">sistemas desconectados.</span>
              </h2>
              <p className="text-lg text-textMuted leading-relaxed mb-10">
                GetUpSoft conecta gestión, infraestructura y soporte para que la operación funcione con más control y visibilidad en tiempo real.
              </p>
              <ul className="space-y-4">
                {PROBLEMS.map((p) => (
                  <li key={p} className="flex items-center gap-4 text-textMuted">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accentTeal" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 sm:p-12 rounded-[40px] bg-background border border-border shadow-soft-2xl">
              <div className="aspect-square bg-surface rounded-3xl flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="text-6xl mb-6">⚙️</div>
                  <h3 className="text-2xl font-bold text-text mb-4">Arquitectura Conectada</h3>
                  <p className="text-textMuted">Diseñamos la capa de inteligencia que une cada parte de tu negocio.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Services Grid */}
      <Section>
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Eyebrow color="accentTeal">Servicios</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold text-text mb-8">
              Todo lo que <span className="text-accentTeal italic">tu empresa necesita</span>.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="p-8 rounded-3xl bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl transition-all duration-300">
                <div className="text-3xl mb-6 text-accentTeal">{s.icon}</div>
                <h3 className="text-xl font-bold text-text mb-4">{s.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed mb-8">{s.desc}</p>
                <Button variant="ghost" to={s.to} className="!p-0 !text-accentTeal hover:!bg-transparent">
                  Ver más →
                </Button>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Sectors */}
      <Section background="surface">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:max-w-md">
              <Eyebrow color="accentTeal">Sectores</Eyebrow>
              <h2 className="text-4xl font-bold text-text mb-6">Atendemos todos los sectores comerciales.</h2>
              <Button variant="outline" to="/sectores" className="mt-4">Ver Sectores</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {SECTORS.map((s) => (
                <span key={s} className="px-6 py-3 rounded-full bg-background border border-border text-sm font-semibold text-textMuted shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section background="accentTealSoft" className="!py-24">
        <Container>
          <div className="bg-background p-12 sm:p-20 rounded-[48px] shadow-soft-2xl flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-bold text-text mb-6">
                Evalúa tu <span className="italic text-accentTeal">infraestructura</span> hoy.
              </h2>
              <p className="text-lg text-textMuted leading-relaxed">
                Implementamos Odoo ERP, facturación electrónica, redes y servidores para empresas que necesitan orden y continuidad.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Button to="/contacto" className="bg-accentTeal px-12 py-5 hover:bg-text">Solicitar Diagnóstico</Button>
              <Button variant="outline" to="/odoo-erp" className="px-12 py-5">Ver Odoo ERP</Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
