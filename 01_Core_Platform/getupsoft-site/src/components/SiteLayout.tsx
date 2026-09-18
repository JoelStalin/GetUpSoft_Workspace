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
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <NavLink to="/" className="min-w-0">
            <div className="[&_*]:text-blue-600">
              <CodeLogo compact />
            </div>
            <p className="mt-1 truncate text-base font-bold text-blue-600">Software, Infrastructure, Automation</p>
          </NavLink>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-600 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "text-blue-600" : "text-gray-600 transition hover:text-gray-900"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <a
              className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 transition hover:border-blue-600 hover:text-blue-600"
              href="https://chatbot.getupsoft.com"
            >
              Chatbot
            </a>
            <a
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
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

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr,0.9fr]">
          <div className="space-y-3">
            <div className="[&_*]:text-blue-600">
              <CodeLogo compact />
            </div>
            <p className="max-w-md text-sm leading-7 text-gray-600">
              Diseñamos producto, infraestructura y automatización para compañías que necesitan operar con más claridad y menos
              fricción.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900">Navegación</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink className="transition hover:text-blue-600" to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900">Accesos</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              {accessLinks.map((item) => (
                <li key={item.label}>
                  <a className="transition hover:text-blue-600" href={item.href}>
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
