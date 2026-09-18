import { useEffect, useRef } from "react";
import anime from "animejs";

const SERVICES = [
  { label: "Odoo ERP", pct: 92, color: "#14B8A6" },
  { label: "Facturación e-CF", pct: 88, color: "#3B82F6" },
  { label: "Inventario", pct: 95, color: "#8B5CF6" },
  { label: "Redes / WiFi", pct: 78, color: "#F43F5E" },
];

export function RDCommandAnime() {
  const cardRef = useRef<HTMLDivElement>(null);
  const progressRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Progress bars
          progressRefs.current.forEach((bar, i) => {
            if (!bar) return;
            anime({
              targets: bar,
              width: [`0%`, `${SERVICES[i].pct}%`],
              duration: 1500,
              delay: i * 150,
              easing: "easeOutExpo",
            });
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="bg-white p-8 rounded-3xl border border-border shadow-soft-xl w-full max-w-sm">
      <div className="flex items-center justify-between mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-textMuted">Operational Health</p>
        <div className="h-2 w-2 rounded-full bg-accentTeal animate-pulse-soft" />
      </div>
      <div className="space-y-6">
        {SERVICES.map((s, i) => (
          <div key={s.label} className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-textSubtle">{s.label}</span>
              <span style={{ color: s.color }}>{s.pct}%</span>
            </div>
            <div className="h-1 w-full bg-surfaceSoft rounded-full overflow-hidden">
              <div
                ref={(el) => { if (el) progressRefs.current[i] = el; }}
                className="h-full rounded-full"
                style={{ width: "0%", backgroundColor: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
