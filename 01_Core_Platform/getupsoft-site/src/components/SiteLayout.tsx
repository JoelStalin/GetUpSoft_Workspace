import { NavLink, Outlet } from "react-router-dom";
import { CodeLogo } from "./CodeLogo";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/chatbot", label: "Chatbot" },
  { to: "/productos", label: "Productos" },
  { to: "/plataforma", label: "Plataforma" },
  { to: "/contacto", label: "Contacto" },
];

const accessLinks = [
  { label: "Chatbot Portal", href: "https://chatbot.getupsoft.com" },
  { label: "EasyCount", href: "https://cliente.getupsoft.com.do/login" },
  { label: "Admin", href: "https://admin.getupsoft.com.do/login" },
  { label: "Socios", href: "https://socios.getupsoft.com.do/login" },
];

export function SiteLayout() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-canvas/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <NavLink to="/" className="min-w-0">
            <div className="[&_*]:text-ink">
              <CodeLogo compact />
            </div>
            <p className="mt-1 truncate text-base font-semibold text-ink">Software, infrastructure, automation</p>
          </NavLink>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "text-ink" : "text-slate-600 transition hover:text-ink"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <a
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-accent hover:text-accent"
              href="https://chatbot.getupsoft.com"
            >
              Chatbot
            </a>
            <a
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="https://cliente.getupsoft.com.do/login"
            >
              Ingresar
            </a>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white/75">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr,0.9fr]">
          <div className="space-y-3">
            <div className="[&_*]:text-ink">
              <CodeLogo compact />
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              Diseñamos producto, infraestructura y automatización para compañías que necesitan operar con más claridad y menos
              fricción.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Navegación</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink className="transition hover:text-ink" to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Accesos</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {accessLinks.map((item) => (
                <li key={item.label}>
                  <a className="transition hover:text-ink" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
