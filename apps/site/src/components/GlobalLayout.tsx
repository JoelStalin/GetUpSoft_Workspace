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
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
  ],
};

export function GlobalLayout() {
  return (
    <div className="min-h-screen bg-background text-text selection:bg-primarySoft selection:text-text">
      {/* Top bar */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] text-textMuted uppercase">
          <span>Enterprise AI Architecture · System Integration · Digital Transformation</span>
          <a
            href="https://getupsoft.com.do"
            className="flex items-center gap-1.5 transition text-primary hover:text-text"
          >
            GetUpSoft RD
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
            <CodeLogo variant="global" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">GetUpSoft</p>
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
                    ? "text-primary"
                    : "transition hover:text-text"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contact"
            className="rounded-full bg-primary text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] transition hover:bg-text hover:shadow-soft-xl"
          >
            Book Strategy
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
                <CodeLogo variant="global" compact />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-textMuted">
                GetUpSoft architects the intelligence and infrastructure that make modern companies operate as one connected, scalable digital ecosystem.
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-textSubtle">
                © {new Date().getFullYear()} GetUpSoft. All rights reserved.
              </p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-text">{group}</p>
                <ul className="mt-6 space-y-3">
                  {links.map((l) => (
                    <li key={l.to}>
                      <NavLink to={l.to} className="text-sm text-textMuted transition hover:text-primary">
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
              <a href="mailto:contact@getupsoft.com" className="transition hover:text-primary">
                contact@getupsoft.com
              </a>
              <a href="tel:+1234567890" className="transition hover:text-primary">
                +1 (234) 567-890
              </a>
              <div>Santo Domingo, Dominican Republic</div>
              <div className="md:text-right">Aesthetic Intelligence</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
