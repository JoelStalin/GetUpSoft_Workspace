import { NavLink, Outlet, Link } from "react-router-dom";
import { CodeLogo } from "./CodeLogo";

const NAV = [
  { to: "/", label: "Inicio", end: true },
  { to: "/odoo-erp", label: "Odoo ERP" },
  { to: "/facturacion-electronica", label: "Facturación" },
  { to: "/infraestructura", label: "Infraestructura" },
  { to: "/sectores", label: "Sectores" },
  { to: "/nosotros", label: "Nosotros" },
];

const FOOTER_LINKS = {
  Servicios: [
    { label: "Odoo ERP", to: "/odoo-erp" },
    { label: "Facturación Electrónica", to: "/facturacion-electronica" },
    { label: "Infraestructura", to: "/infraestructura" },
    { label: "Redes Empresariales", to: "/redes-empresariales" },
  ],
  Empresa: [
    { label: "Nosotros", to: "/nosotros" },
    { label: "Casos", to: "/casos" },
    { label: "Sectores", to: "/sectores" },
    { label: "Contacto", to: "/contacto" },
  ],
  Legal: [
    { label: "Política de Privacidad", to: "/privacy" },
    { label: "Términos de Servicio", to: "/terms" },
  ],
};

export function RDLayout() {
  return (
    <div className="min-h-screen bg-background text-text selection:bg-accentTealSoft selection:text-text">
      {/* Top bar */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] text-textMuted uppercase">
          <span>República Dominicana · Odoo ERP · Facturación e-CF · Infraestructura</span>
          <a
            href="https://getupsoft.com"
            className="flex items-center gap-1.5 transition text-accentTeal hover:text-text"
          >
            GetUpSoft Global
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <NavLink to="/" className="flex items-center gap-3 group">
            <CodeLogo variant="rd" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accentTeal">Dominican Republic</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.1em] text-textMuted lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? "text-accentTeal"
                    : "transition hover:text-text"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contacto"
            className="rounded-full bg-accentTeal text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] transition hover:bg-text hover:shadow-soft-xl"
          >
            Diagnóstico
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.5fr,1fr,1fr,1fr]">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <CodeLogo variant="rd" compact />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-textMuted">
                GetUpSoft conecta gestión, infraestructura y soporte local para que las empresas dominicanas operen con más control, velocidad y continuidad estratégica.
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-textSubtle">
                © {new Date().getFullYear()} GetUpSoft RD. Todos los derechos reservados.
              </p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-text">{group}</p>
                <ul className="mt-6 space-y-3">
                  {links.map((l) => (
                    <li key={l.to}>
                      <NavLink to={l.to} className="text-sm text-textMuted transition hover:text-accentTeal">
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom divider */}
          <div className="mt-16 border-t border-border pt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 text-xs font-medium text-textSubtle">
              <a href="mailto:contacto@getupsoft.com.do" className="transition hover:text-accentTeal">
                contacto@getupsoft.com.do
              </a>
              <a href="tel:+18095551234" className="transition hover:text-accentTeal">
                +1 (809) 555-1234
              </a>
              <div>Santo Domingo, Dominican Republic</div>
              <div className="md:text-right">Aesthetic Management</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
