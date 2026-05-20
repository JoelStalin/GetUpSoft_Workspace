import { NavLink, Outlet } from "react-router-dom";
import { CodeLogo } from "./CodeLogo";
import { Button } from "./ui/Button";

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
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <NavLink to="/" className="min-w-0 flex items-center gap-3">
            <CodeLogo compact />
            <p className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-primary">Intelligence & Infrastructure</p>
          </NavLink>

          <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-textMuted lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "text-primary" : "transition hover:text-text"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="outline" href="https://chatbot.getupsoft.com" className="hidden sm:inline-flex">
              Chatbot
            </Button>
            <Button href="https://cliente.getupsoft.com.do/login">
              Ingresar
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.5fr,1fr,1fr]">
          <div className="space-y-6">
            <CodeLogo compact />
            <p className="max-w-md text-sm leading-relaxed text-textMuted">
              Diseñamos producto, infraestructura y automatización para compañías que necesitan operar con más claridad, escala y continuidad estratégica.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text mb-6">Navegación</p>
            <ul className="space-y-3">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink className="text-sm text-textMuted transition hover:text-primary" to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text mb-6">Accesos</p>
            <ul className="space-y-3">
              {accessLinks.map((item) => (
                <li key={item.label}>
                  <a className="text-sm text-textMuted transition hover:text-primary" href={item.href}>
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
