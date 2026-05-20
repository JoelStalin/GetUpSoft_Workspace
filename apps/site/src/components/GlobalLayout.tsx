import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "./nav/Navbar";
import { ScrollVideo } from "./ui/ScrollVideo";

const NAV_ITEMS = [
  { to: "/es", label: "Home", end: true },
  { to: "/es/ai-agents", label: "AI Agents" },
  { to: "/es/system-integration", label: "Integration" },
  { to: "/es/products", label: "Products" },
  { to: "/es/solutions", label: "Solutions" },
  { to: "/es/about", label: "About" },
];

const FOOTER_LINKS = {
  Solutions: [
    { label: "AI Agents", to: "/es/ai-agents" },
    { label: "System Integration", to: "/es/system-integration" },
    { label: "Digital Transformation", to: "/es/digital-transformation" },
    { label: "Products", to: "/es/products" },
  ],
  Company: [
    { label: "About", to: "/es/about" },
    { label: "Case Studies", to: "/es/case-studies" },
    { label: "Methodology", to: "/es/methodology" },
    { label: "Contact", to: "/es/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/es/privacy" },
    { label: "Terms of Service", to: "/es/terms" },
  ],
};

export function GlobalLayout() {
  return (
    <div className="min-h-screen bg-background text-text selection:bg-primarySoft selection:text-text">
      {/* Background Scroll Effect */}
      <ScrollVideo src="https://assets.mixkit.co/videos/preview/mixkit-launching-a-rocket-into-the-clouds-40544-large.mp4" />

      <Navbar 
        variant="global" 
        items={NAV_ITEMS} 
        ctaLabel="Book Strategy" 
        ctaTo="/es/contact" 
      />

      <main>
        <Outlet />
      </main>

      {/* Footer with Socials */}
      <footer className="relative border-t border-border bg-white/50 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-8 py-24">
          <div className="grid gap-16 lg:grid-cols-[1.5fr,1fr,1fr,1.2fr]">
            <div className="space-y-8">
              <div className="text-xl font-bold tracking-tight">GetUpSoft</div>
              <p className="max-w-sm text-sm leading-relaxed text-textMuted">
                Architecting the next layer of operational intelligence. From ERP integration to autonomous AI agents.
              </p>
              
              {/* Social Media Buttons */}
              <div className="flex items-center gap-4">
                {['Twitter', 'LinkedIn', 'GitHub', 'YouTube'].map(platform => (
                  <a 
                    key={platform}
                    href={`#${platform.toLowerCase()}`} 
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center transition-all hover:bg-primary hover:text-white hover:border-primary shadow-sm"
                    aria-label={platform}
                  >
                    <span className="text-[10px] font-bold uppercase">{platform[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-text mb-8">{group}</p>
                <ul className="space-y-4">
                  {links.map((l) => (
                    <li key={l.to}>
                      <NavLink to={l.to} className="text-sm text-textMuted transition-colors hover:text-primary">
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="bg-surface p-10 rounded-3xl border border-border">
               <p className="text-[11px] font-bold uppercase tracking-widest mb-6">Newsletter</p>
               <div className="flex gap-2">
                  <input className="bg-white border border-border px-4 py-2 rounded-xl text-xs flex-1 outline-none focus:border-primary" placeholder="Email address" />
                  <button className="bg-text text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-primary">Join</button>
               </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-border flex flex-col md:flex-row justify-between gap-8 items-center text-[10px] font-bold uppercase tracking-[0.2em] text-textSubtle">
            <div className="flex gap-12">
              <span>© {new Date().getFullYear()} GetUpSoft</span>
              <span>Built for Scale</span>
            </div>
            <div className="md:text-right flex gap-12">
              <span>Santo Domingo, DR</span>
              <span className="text-primary">Aesthetic Intelligence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
