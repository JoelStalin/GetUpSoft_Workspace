import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/use-auth";
import { TourController } from "../tours/TourController";

const NAV = [
  { to: "/dashboard", label: "Dashboard", permissions: ["PLATFORM_TENANT_VIEW", "PLATFORM_PLAN_CRUD"] },
  { to: "/companies", label: "Companias", permissions: ["PLATFORM_TENANT_VIEW"] },
  { to: "/plans", label: "Planes", permissions: ["PLATFORM_PLAN_CRUD"] },
  { to: "/ai-providers", label: "Agentes IA", permissions: ["PLATFORM_AI_PROVIDER_MANAGE"] },
  { to: "/audit-logs", label: "Auditoria", permissions: ["PLATFORM_AUDIT_VIEW"] },
  { to: "/users", label: "Usuarios", permissions: ["PLATFORM_USER_MANAGE"] },
];

export function AppLayout() {
  const { logout, user, permissions } = useAuth();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 border-r border-border bg-surface/95 backdrop-blur-xl p-6 lg:block">
        <div className="mb-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="50" y="50" width="100" height="100" rx="24" stroke="#99F6E4" stroke-width="14"/>
                <path d="M80 100L95 120L125 85" stroke="#99F6E4" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-display font-semibold text-white tracking-wider uppercase">EasyCounting</h2>
              <p className="text-[9px] uppercase tracking-[0.3em] text-primary/60 font-bold">Admin Portal</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-primary/20 via-transparent to-transparent"></div>
        </div>
        <nav className="space-y-1 text-[13px] font-medium" data-tour="portal-nav">
          {NAV.filter((item) => item.permissions.some((perm) => permissions.includes(perm))).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center rounded-md px-3 py-2 transition ${isActive ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground hover:bg-white/5"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-background/60 backdrop-blur px-6 py-4">
          <div data-tour="session-user">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">System Operator</p>
            <p className="text-sm font-medium text-foreground opacity-90">{user?.email ?? "sesion no activa"}</p>
          </div>
          <div className="flex items-center gap-3">
            <TourController />
            <button
              onClick={logout}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:border-primary hover:text-primary transition-all"
            >
              Cerrar sesión
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
