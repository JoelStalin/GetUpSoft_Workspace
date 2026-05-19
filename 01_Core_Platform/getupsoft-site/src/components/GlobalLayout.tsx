import { NavLink, Outlet, Link } from "react-router-dom";
import { CodeLogo } from "./CodeLogo";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/ai-agents", label: "AI Agents" },
  { to: "/system-integration", label: "Integration" },
  { to: "/products", label: "Products" },
  { to: "/solutions", label: "Solutions" },
  { to: "/about", label: "About" },
];

const FOOTER_LINKS = {
  Solutions: [
    { label: "AI Agents", to: "/ai-agents" },
    { label: "System Integration", to: "/system-integration" },
    { label: "Digital Transformation", to: "/digital-transformation" },
    { label: "Products", to: "/products" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Case Studies", to: "/case-studies" },
    { label: "Methodology", to: "/methodology" },
    { label: "Contact", to: "/contact" },
  ],
};

export function GlobalLayout() {
  return (
    <div className="min-h-screen bg-bg-deep text-text-main hero-gradient-global">
      {/* Top bar */}
      <div className="border-b border-border-subtle bg-bg-surface/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-[10px] font-medium tracking-widest text-text-muted uppercase">
          <span>Enterprise AI Architecture · System Integration · Digital Transformation</span>
          <a
            href="https://getupsoft.com.do"
            className="flex items-center gap-1.5 transition hover:text-accent-global"
          >
            GetUpSoft RD
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
            <CodeLogo variant="global" />
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-text-muted">Global</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-8 text-[12px] font-medium uppercase tracking-wider text-text-muted lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "text-accent-global" : "transition hover:text-text-main"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contact"
            className="rounded-full border border-accent-global px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-accent-global transition hover:bg-accent-global hover:text-bg-deep"
          >
            Book Strategy
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
                <CodeLogo variant="global" compact />
              </div>
              <p className="max-w-sm text-sm leading-7 text-text-muted">
                GetUpSoft designs the intelligence and infrastructure that make companies operate as one connected system.
              </p>
              <p className="text-[10px] uppercase tracking-widest text-text-muted/50">
                © {new Date().getFullYear()} GetUpSoft. All rights reserved.
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
