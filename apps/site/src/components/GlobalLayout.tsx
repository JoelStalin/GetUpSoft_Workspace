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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-xs font-semibold tracking-widest text-gray-600 uppercase">
          <span>Enterprise AI Architecture · System Integration · Digital Transformation</span>
          <a
            href="https://getupsoft.com.do"
            className="flex items-center gap-1.5 transition text-blue-600 hover:text-blue-700"
          >
            GetUpSoft RD
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
            <CodeLogo variant="global" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">GetUpSoft</p>
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
                    ? "text-blue-600"
                    : "transition hover:text-gray-900"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contact"
            className="rounded-lg bg-blue-600 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
          >
            Get Started
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
                <CodeLogo variant="global" compact />
              </div>
              <p className="max-w-sm text-sm leading-7 text-gray-600">
                GetUpSoft designs the intelligence and infrastructure that make companies operate as one connected system.
              </p>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                © {new Date().getFullYear()} GetUpSoft. All rights reserved.
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
              <a href="mailto:contact@getupsoft.com" className="transition hover:text-blue-600">
                contact@getupsoft.com
              </a>
              <a href="tel:+1234567890" className="transition hover:text-blue-600">
                +1 (234) 567-890
              </a>
              <div>Santo Domingo, DR</div>
              <div>Enterprise Solutions</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
