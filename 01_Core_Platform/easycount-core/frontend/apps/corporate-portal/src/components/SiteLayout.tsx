import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/plataforma", label: "Plataforma" },
  { to: "/contacto", label: "Contacto" },
];

export function SiteLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="50" y="50" width="100" height="100" rx="24" stroke="#99F6E4" stroke-width="14"/>
                <path d="M80 100L95 120L125 85" stroke="#99F6E4" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold leading-none mb-1">EasyCounting</p>
              <p className="text-sm font-display font-medium text-white tracking-tight">by GetUpSoft</p>
            </div>
          </div>
          <nav className="hidden gap-8 text-[13px] font-medium text-muted md:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "text-primary" : "hover:text-foreground transition-colors")}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a className="text-[13px] font-medium text-muted hover:text-foreground transition-colors" href="https://admin.getupsoft.com.do/login">
              Admin
            </a>
            <a className="rounded-full bg-primary px-5 py-2 text-[13px] font-medium text-bgDeep hover:bg-white transition-all shadow-lg shadow-primary/5" href="https://cliente.getupsoft.com.do/login">
              Ingresar
            </a>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="py-20 border-t border-border bg-surface/30">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-muted text-[11px]">
            <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-primary rounded-full opacity-50"></div>
                <span className="tracking-widest font-medium uppercase">EasyCounting by GetUpSoft</span>
            </div>
            <div className="flex space-x-8 font-medium tracking-wider uppercase">
                <a href="https://admin.getupsoft.com.do/login" className="hover:text-foreground transition-colors">Admin</a>
                <a href="https://cliente.getupsoft.com.do/login" className="hover:text-foreground transition-colors">Clientes</a>
                <a href="https://socios.getupsoft.com.do/login" className="hover:text-foreground transition-colors">Socios</a>
            </div>
        </div>
    </footer>
    </div>
  );
}
