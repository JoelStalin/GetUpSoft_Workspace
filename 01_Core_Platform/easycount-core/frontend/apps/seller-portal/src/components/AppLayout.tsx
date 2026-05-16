import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/use-auth";
import { TourController } from "../tours/TourController";

const NAV = [
  { to: "/dashboard", label: "Dashboard", permissions: ["PARTNER_DASHBOARD_VIEW"] },
  { to: "/clients", label: "Clientes", permissions: ["PARTNER_TENANT_VIEW"] },
  { to: "/invoices", label: "Comprobantes", permissions: ["PARTNER_INVOICE_READ"] },
  { to: "/emit/ecf", label: "Emitir demo", permissions: ["PARTNER_INVOICE_EMIT"] },
  { to: "/profile", label: "Perfil", permissions: [] },
];

export function AppLayout() {
  const { logout, user, permissions } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 border-r border-border bg-surface/95 backdrop-blur-xl p-6 md:block">
        <div className="mb-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="50" y="50" width="100" height="100" rx="24" stroke="#99F6E4" stroke-width="14"/>
                <path d="M80 100L95 120L125 85" stroke="#99F6E4" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-display font-semibold text-white tracking-wider uppercase leading-none mb-1">EasyCounting</h2>
              <p className="text-[9px] uppercase tracking-[0.3em] text-primary/60 font-bold">Partners</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-primary/20 via-transparent to-transparent"></div>
        </div>
        <nav className="space-y-1 text-[13px] font-medium" data-tour="portal-nav">
          {NAV.filter((item) => item.permissions.length === 0 || item.permissions.some((perm) => permissions.includes(perm))).map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 transition ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-background/60 backdrop-blur px-6 py-4">
          <div data-tour="session-user">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Partner Session</p>
            <p className="text-sm font-medium text-foreground opacity-90">{user?.email ?? "sin sesion"}</p>
          </div>
          <div className="flex items-center gap-3">
            <TourController />
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:border-primary hover:text-primary transition-all"
            >
              Salir
            </button>
          </div>
        </header>
        <div className="px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
