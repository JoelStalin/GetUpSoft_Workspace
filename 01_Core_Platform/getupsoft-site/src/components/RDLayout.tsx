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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-xs font-semibold tracking-widest text-gray-600 uppercase">
          <span>República Dominicana · Odoo ERP · Facturación e-CF · Infraestructura</span>
          <a
            href="https://getupsoft.com"
            className="flex items-center gap-1.5 transition text-green-600 hover:text-green-700"
          >
            GetUpSoft Global
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <NavLink to="/" className="flex items-center gap-3 group">
            <CodeLogo variant="rd" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-600">República Dominicana</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-600 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? "text-green-600"
                    : "transition hover:text-gray-900"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contacto"
            className="rounded-lg bg-green-600 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30"
          >
            Diagnóstico
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.5fr,1fr,1fr,1fr]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CodeLogo variant="rd" compact />
              </div>
              <p className="max-w-sm text-sm leading-7 text-gray-600">
                GetUpSoft conecta gestión, infraestructura y soporte local para que las empresas dominicanas operen con más control, velocidad y continuidad.
              </p>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                © {new Date().getFullYear()} GetUpSoft RD. Todos los derechos reservados.
              </p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{group}</p>
                <ul className="mt-5 space-y-3">
                  {links.map((l) => (
                    <li key={l.to}>
                      <NavLink to={l.to} className="text-sm text-gray-600 transition hover:text-gray-900">
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom divider */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-xs text-gray-600">
              <a href="mailto:contacto@getupsoft.com.do" className="transition hover:text-green-600">
                contacto@getupsoft.com.do
              </a>
              <a href="tel:+18095551234" className="transition hover:text-green-600">
                +1 (809) 555-1234
              </a>
              <div>Santo Domingo, DR</div>
              <div>Soluciones Empresariales</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
