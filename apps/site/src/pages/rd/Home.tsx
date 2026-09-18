import { Section } from "../../components/ui/Section";
import { Container } from "../../components/ui/Container";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { Button } from "../../components/ui/Button";
import { Counter } from "../../components/ui/Counter";
import { RDCommandAnime } from "../../animations/RDCommandAnime";
import { useScrollReveal } from "../../animations/useAnimeScroll";

const SERVICES = [
  {
    icon: "◈",
    title: "Odoo ERP",
    desc: "Implementación completa de Odoo para ventas, inventario, contabilidad, CRM y facturación.",
    to: "/es/rd/odoo-erp",
  },
  {
    icon: "◎",
    title: "Facturación Electrónica",
    desc: "e-CF conforme a DGII. Emisión, validación y reportes integrados con tu sistema de gestión.",
    to: "/es/rd/facturacion-electronica",
  },
  {
    icon: "⬡",
    title: "Infraestructura",
    desc: "Servidores, cableado estructurado, racks, WiFi empresarial y continuidad operativa.",
    to: "/es/rd/infraestructura",
  },
  {
    icon: "▣",
    title: "Redes Empresariales",
    desc: "Diseño e instalación de redes LAN/WiFi para oficinas, almacenes y sucursales.",
    to: "/es/rd/redes-empresariales",
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

const LOCAL_STATS = [
  { label: "Empresas en RD", value: 120, suffix: "+" },
  { label: "Cumplimiento DGII", value: 100, suffix: "%" },
  { label: "Soporte Local", value: 24, suffix: "/7" },
];

export function RDHomePage() {
  const serviceRef = useScrollReveal<HTMLDivElement>({ childSelector: ".service-card" });

  return (
    <div className="bg-background relative">
      {/* ── HERO (Elite RD Theme) ── */}
      <Section background="transparent" className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-subtle opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accentTealSoft/20 rounded-full blur-[160px] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <div className="animate-fade-in-slow space-y-12">
            <Eyebrow color="accentTeal" className="justify-center">Soluciones Tangibles · Software + Hardware</Eyebrow>
            <h1 className="text-7xl md:text-8xl lg:text-[110px] font-bold tracking-tight text-text leading-[0.9] max-w-6xl mx-auto">
              Infraestructura y <span className="italic text-accentTeal">Gestión</span> Local.
            </h1>
            <p className="text-xl md:text-2xl text-textMuted max-w-3xl mx-auto leading-relaxed font-medium">
              Implementamos Odoo ERP, facturación electrónica DGII e infraestructura empresarial para que tu operación fluya sin interrupciones en República Dominicana.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button to="/es/rd/contacto" className="!bg-accentTeal !text-white !px-12 !py-5 !text-xs shadow-soft-xl hover:!bg-text transition-all">
                Solicitar Diagnóstico
              </Button>
              <Button variant="secondary" to="/es/rd/odoo-erp" className="!bg-accentTealSoft !text-accentTeal !px-12 !py-5 !text-xs hover:!bg-accentTeal hover:!text-white transition-all">
                Ver Servicios
              </Button>
            </div>
          </div>
        </Container>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-float">
           <div className="w-px h-16 bg-gradient-to-b from-accentTeal to-transparent" />
        </div>
      </Section>

      {/* ── LOCAL STATS ── */}
      <div className="bg-surface py-12 border-y border-border">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {LOCAL_STATS.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-5xl font-bold text-text">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-textSubtle">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ── OPERATIONAL VISUAL ── */}
      <Section>
        <Container>
           <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-8">
                 <Eyebrow color="accentTeal">Centro de Control</Eyebrow>
                 <h2 className="text-5xl font-bold text-text leading-tight">
                    Conecta tu <span className="text-accentTeal italic">negocio</span> <br /> de punta a punta.
                 </h2>
                 <p className="text-lg text-textMuted leading-relaxed">
                    Desde el servidor en tu oficina hasta la factura en la DGII. Diseñamos la arquitectura que permite que tus equipos se enfoquen en vender, mientras el sistema cuida la operación.
                 </p>
                 <div className="pt-6">
                    <Button variant="ghost" to="/es/rd/odoo-erp" className="!text-accentTeal">Explorar Odoo ERP</Button>
                 </div>
              </div>
              <div className="relative p-10 bg-surface rounded-[48px] border border-border shadow-soft-xl">
                 <RDCommandAnime />
              </div>
           </div>
        </Container>
      </Section>

      {/* ── SERVICES GRID ── */}
      <Section background="surface">
        <Container>
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end mb-20">
            <div className="space-y-4">
              <Eyebrow color="accentTeal">Servicios Especializados</Eyebrow>
              <h2 className="text-5xl font-bold tracking-tight text-text">
                Capacidad <span className="italic text-accentTeal">Total.</span>
              </h2>
            </div>
            <Button variant="ghost" to="/es/rd/contacto" className="!p-0 !text-accentTeal">
              Hablar con Soporte
            </Button>
          </div>

          <div ref={serviceRef} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <article key={s.title} className="service-card p-10 rounded-[32px] bg-background border border-border shadow-soft-xl hover:shadow-soft-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="text-4xl mb-8 text-accentTeal transition-transform group-hover:scale-110">{s.icon}</div>
                <h3 className="text-xl font-bold text-text mb-4 group-hover:text-accentTeal transition-colors">{s.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed mb-8">{s.desc}</p>
                <Button variant="ghost" to={s.to} className="!p-0 !text-accentTeal">
                  Ver más
                </Button>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── SECTORS (Elite) ── */}
      <Section>
        <Container>
          <div className="bg-surface p-12 lg:p-24 rounded-[64px] border border-border overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accentTealSoft/20 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
               <div className="space-y-8">
                  <Eyebrow color="accentTeal">Sectores</Eyebrow>
                  <h2 className="text-5xl font-bold text-text leading-tight">Soluciones para cada <span className="text-accentTeal italic">industria</span>.</h2>
                  <p className="text-lg text-textMuted leading-relaxed">
                     Adaptamos nuestra arquitectura a la realidad de tu sector. No instalamos software, diseñamos continuidad operativa.
                  </p>
                  <Button variant="outline" to="/es/rd/sectores" className="border-accentTeal text-accentTeal hover:bg-accentTeal hover:text-white">Ver Sectores</Button>
               </div>
               <div className="flex flex-wrap gap-4">
                  {SECTORS.map((s, i) => (
                    <span key={s} className="px-8 py-4 rounded-2xl bg-background border border-border text-sm font-bold text-textMuted shadow-sm hover:border-accentTeal transition-all cursor-default animate-fade-in-slow" style={{ animationDelay: `${i * 100}ms` }}>
                      {s}
                    </span>
                  ))}
               </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── CONVERSION ── */}
      <Section background="accentTealSoft" className="!py-32">
        <Container>
          <div className="bg-text p-16 sm:p-24 rounded-[64px] shadow-soft-2xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accentTeal/20 rounded-full blur-[120px] -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-110" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                ¿Listo para estabilizar tu <span className="text-accentTeal italic">infraestructura?</span>
              </h2>
              <p className="text-xl text-white/60 leading-relaxed">
                Agenda un diagnóstico técnico hoy y descubre cómo podemos optimizar tu gestión.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <Button to="/es/rd/contacto" className="!bg-accentTeal !text-white !px-12 !py-5 hover:!bg-white hover:!text-text transition-all">Solicitar Diagnóstico</Button>
                <Button variant="outline" to="/es/rd/nosotros" className="!border-white/20 !text-white !px-12 !py-5 hover:!bg-white/10 transition-all">Nuestra Filosofía</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
