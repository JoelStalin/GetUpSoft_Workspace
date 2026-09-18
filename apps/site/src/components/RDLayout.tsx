import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "./nav/Navbar";
import { ScrollVideo } from "./ui/ScrollVideo";

const NAV_ITEMS = [
  { to: "/es/rd", label: "Inicio", end: true },
  { to: "/es/rd/odoo-erp", label: "Odoo ERP" },
  { to: "/es/rd/facturacion-electronica", label: "Facturación" },
  { to: "/es/rd/infraestructura", label: "Infraestructura" },
  { to: "/es/rd/sectores", label: "Sectores" },
  { to: "/es/rd/nosotros", label: "Nosotros" },
];

const FOOTER_LINKS = {
  Servicios: [
    { label: "Odoo ERP", to: "/es/rd/odoo-erp" },
    { label: "Facturación Electrónica", to: "/es/rd/facturacion-electronica" },
    { label: "Infraestructura", to: "/es/rd/infraestructura" },
    { label: "Redes Empresariales", to: "/es/rd/redes-empresariales" },
  ],
  Empresa: [
    { label: "Nosotros", to: "/es/rd/nosotros" },
    { label: "Casos", to: "/es/rd/casos" },
    { label: "Sectores", to: "/es/rd/sectores" },
    { label: "Contacto", to: "/es/rd/contacto" },
  ],
  Legal: [
    { label: "Política de Privacidad", to: "/es/privacy" },
    { label: "Términos de Servicio", to: "/es/terms" },
  ],
};

export function RDLayout() {
  return (
    <div className="min-h-screen bg-background text-text selection:bg-accentTealSoft selection:text-text">
      {/* Background Scroll Effect (RD Theme) */}
      <ScrollVideo src="https://assets.mixkit.co/videos/preview/mixkit-launching-a-rocket-into-the-clouds-40544-large.mp4" />

      <Navbar 
        variant="rd" 
        items={NAV_ITEMS} 
        ctaLabel="Diagnóstico" 
        ctaTo="/es/rd/contacto" 
      />

      <main>
        <Outlet />
      </main>

      {/* Footer with Socials */}
      <footer className="relative border-t border-border bg-white/50 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-8 py-24">
          <div className="grid gap-16 lg:grid-cols-[1.5fr,1fr,1fr,1.2fr]">
            <div className="space-y-8">
              <div className="text-xl font-bold tracking-tight">GetUpSoft <span className="text-accentTeal">RD</span></div>
              <p className="max-w-sm text-sm leading-relaxed text-textMuted">
                Infraestructura y gestión para el éxito local. El socio tecnológico para empresas dominicanas en crecimiento.
              </p>
              
              {/* Social Media Buttons */}
              <div className="flex items-center gap-4">
                {['Twitter', 'LinkedIn', 'Instagram', 'Facebook'].map(platform => (
                  <a 
                    key={platform}
                    href={`#${platform.toLowerCase()}`} 
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center transition-all hover:bg-accentTeal hover:text-white hover:border-accentTeal shadow-sm"
                    aria-label={platform}
                  >
                    <span className="text-[10px] font-bold uppercase">{platform[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-text mb-8">{group}</p>
                <ul className="space-y-4">
                  {links.map((l) => (
                    <li key={l.to}>
                      <NavLink to={l.to} className="text-sm text-textMuted transition-colors hover:text-accentTeal">
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="bg-surface p-10 rounded-3xl border border-border">
               <p className="text-[11px] font-bold uppercase tracking-widest mb-6">Contáctanos</p>
               <div className="space-y-2">
                  <p className="text-xs font-bold">contacto@getupsoft.com.do</p>
                  <p className="text-xs font-medium text-textMuted">+1 (809) 555-1234</p>
               </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-border flex flex-col md:flex-row justify-between gap-8 items-center text-[10px] font-bold uppercase tracking-[0.2em] text-textSubtle">
            <div className="flex gap-12">
              <span>© {new Date().getFullYear()} GetUpSoft RD</span>
              <span>Soluciones Empresariales</span>
            </div>
            <div className="md:text-right flex gap-12">
              <span>Santo Domingo, RD</span>
              <span className="text-accentTeal">Gestión Estética</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
