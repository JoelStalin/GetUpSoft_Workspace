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
};

export function RDLayout() {
  return (
    <div className="min-h-screen bg-bg-deep text-text-main hero-gradient-rd">
      {/* Top bar */}
      <div className="border-b border-border-subtle bg-bg-surface/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-[10px] font-medium tracking-widest text-text-muted uppercase">
          <span>República Dominicana · Odoo ERP · Facturación e-CF · Infraestructura</span>
          <a
            href="https://getupsoft.com"
            className="flex items-center gap-1.5 transition hover:text-accent-rd"
          >
            GetUpSoft Global
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-deep/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <NavLink to="/" className="flex items-center gap-3 group">
            <CodeLogo variant="rd" />
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-text-muted">República Dominicana</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-7 text-[12px] font-medium uppercase tracking-wider text-text-muted lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "text-accent-rd" : "transition hover:text-text-main"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contacto"
            className="rounded-full border border-accent-rd px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-accent-rd transition hover:bg-accent-rd hover:text-bg-deep"
          >
            Diagnóstico
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.5fr,1fr,1fr]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CodeLogo variant="rd" compact />
              </div>
              <p className="max-w-sm text-sm leading-7 text-text-muted">
                GetUpSoft conecta gestión, infraestructura y soporte local para que las empresas dominicanas operen con más control, velocidad y continuidad.
              </p>
              <p className="text-[10px] uppercase tracking-widest text-text-muted/50">
                © {new Date().getFullYear()} GetUpSoft RD. Todos los derechos reservados.
              </p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-soft">{group}</p>
                <ul className="mt-5 space-y-3">
                  {links.map((l) => (
                    <li key={l.to}>
                      <NavLink to={l.to} className="text-sm text-text-muted transition hover:text-text-main">
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
