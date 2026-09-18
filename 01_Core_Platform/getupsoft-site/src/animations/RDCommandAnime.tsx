/**
 * GetUpSoft RD — Operational Command Center Hero Visual
 * Powered by anime.js v4: progress bars, node connections, data flow
 */
import { useEffect, useRef } from "react";
import { animate, stagger, createTimeline } from "animejs";

const SERVICES = [
  { label: "Odoo ERP", pct: 92, color: "#99F6E4" },
  { label: "Facturación e-CF", pct: 88, color: "#67E8F9" },
  { label: "Inventario", pct: 95, color: "#A5B4FC" },
  { label: "Redes / WiFi", pct: 78, color: "#C084FC" },
  { label: "DGII", pct: 100, color: "#6EE7B7" },
];

const NETWORK_NODES = [
  { label: "Odoo", x: 80, y: 40 },
  { label: "e-CF", x: 200, y: 20 },
  { label: "DGII", x: 310, y: 40 },
  { label: "Server", x: 340, y: 120 },
  { label: "WiFi", x: 310, y: 200 },
  { label: "POS", x: 200, y: 220 },
  { label: "Almacén", x: 80, y: 200 },
  { label: "Contab.", x: 40, y: 120 },
];

const NET_CENTER = { x: 190, y: 120 };

export function RDCommandAnime() {
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const progressRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    const svg = svgRef.current;
    if (!card || !svg) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Progress bars
    const bars = progressRefs.current;
    bars.forEach((b) => { if (b) b.style.width = "0%"; });

    if (prefersReduced) {
      bars.forEach((b, i) => {
        if (b) b.style.width = `${SERVICES[i]?.pct ?? 0}%`;
      });
      return;
    }

    // SVG network lines
    const lines = svg.querySelectorAll<SVGLineElement>(".net-line");
    const nodeDots = svg.querySelectorAll<SVGCircleElement>(".net-node");
    const nodeLabels = svg.querySelectorAll<SVGTextElement>(".net-label");

    lines.forEach((l) => {
      const len = l.getTotalLength?.() ?? 100;
      l.style.strokeDasharray = `${len}`;
      l.style.strokeDashoffset = `${len}`;
      l.style.opacity = "0";
    });
    nodeDots.forEach((d) => { d.style.opacity = "0"; d.style.transform = "scale(0)"; d.style.transformOrigin = "center"; });
    nodeLabels.forEach((t) => { t.style.opacity = "0"; });
    card.style.opacity = "0";
    card.style.transform = "translateY(16px)";

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const tl = createTimeline({ defaults: { ease: "easeOutExpo" } });

        // Card fade in
        tl.add(card, {
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 600,
        }, 0);

        // Network lines draw
        tl.add(lines, {
          strokeDashoffset: [null, 0],
          opacity: [0, 0.45],
          duration: 500,
          delay: stagger(60),
        }, 200);

        // Network nodes pop
        tl.add(nodeDots, {
          opacity: [0, 1],
          scale: [0, 1],
          duration: 300,
          delay: stagger(50),
        }, 550);

        // Labels
        tl.add(nodeLabels, {
          opacity: [0, 0.8],
          duration: 250,
          delay: stagger(40),
        }, 750);

        // Progress bars animate to target widths sequentially
        bars.forEach((bar, i) => {
          if (!bar) return;
          tl.add(bar, {
            width: ["0%", `${SERVICES[i]?.pct ?? 0}%`],
            duration: 900,
            easing: "easeOutExpo",
          }, 600 + i * 120);
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(card);

    // Pulse center node
    const center = svg.querySelector<SVGCircleElement>(".net-center-pulse");
    if (center) {
      animate(center, {
        opacity: [0.3, 0.9, 0.3],
        scale: [1, 1.4, 1],
        duration: 2400,
        loop: true,
        easing: "easeInOutSine",
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-5" style={{ width: 420 }}>
      {/* Network diagram */}
      <div className="glass rounded-3xl p-4">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-accent-rd">Red de sistemas RD</p>
        <svg
          ref={svgRef}
          viewBox="0 0 380 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          aria-hidden="true"
        >
          {/* Connection lines from center to each node */}
          {NETWORK_NODES.map((node, i) => (
            <line
              key={node.label}
              className="net-line"
              x1={NET_CENTER.x}
              y1={NET_CENTER.y}
              x2={node.x}
              y2={node.y}
              stroke="#99F6E4"
              strokeWidth="0.8"
            />
          ))}

          {/* Center glow */}
          <circle cx={NET_CENTER.x} cy={NET_CENTER.y} r={28} fill="rgba(153,246,228,0.06)" />
          <circle
            className="net-center-pulse"
            cx={NET_CENTER.x}
            cy={NET_CENTER.y}
            r={20}
            fill="none"
            stroke="#99F6E4"
            strokeWidth="1"
            style={{ transformOrigin: `${NET_CENTER.x}px ${NET_CENTER.y}px` }}
          />
          <circle cx={NET_CENTER.x} cy={NET_CENTER.y} r={10} fill="#1C2028" stroke="#99F6E4" strokeWidth="1.5" />
          <text
            x={NET_CENTER.x}
            y={NET_CENTER.y + 3.5}
            textAnchor="middle"
            fill="#99F6E4"
            fontSize="6"
            fontFamily="IBM Plex Mono"
          >
            HUB
          </text>

          {/* Peripheral nodes */}
          {NETWORK_NODES.map((node) => (
            <g key={node.label}>
              <circle
                className="net-node"
                cx={node.x}
                cy={node.y}
                r={7}
                fill="#1C2028"
                stroke="#99F6E4"
                strokeWidth="1.2"
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              />
              <text
                className="net-label"
                x={node.x}
                y={node.y + (node.y < NET_CENTER.y ? -11 : 17)}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="7"
                fontFamily="IBM Plex Mono"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Progress card */}
      <div ref={cardRef} className="glass rounded-3xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-rd">Centro de Operaciones</p>
          <div className="flex h-2 w-2 animate-pulse rounded-full bg-accent-rd shadow-[0_0_8px_rgba(153,246,228,0.5)]" />
        </div>

        <div className="space-y-4">
          {SERVICES.map((s, i) => (
            <div key={s.label} className="space-y-1.5">
              <div className="flex justify-between">
                <p className="font-mono text-[10px] text-text-muted">{s.label}</p>
                <p className="font-mono text-[10px]" style={{ color: s.color }}>{s.pct}%</p>
              </div>
              <div className="h-1 w-full rounded-full bg-border-subtle">
                <div
                  ref={(el) => { if (el) progressRefs.current[i] = el; }}
                  className="h-full rounded-full"
                  data-progress={s.pct}
                  style={{ width: "0%", backgroundColor: s.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-accent-rd/20 bg-accent-rd-dim px-4 py-3 text-center">
          <p className="font-mono text-[9px] uppercase tracking-widest text-accent-rd">Cumplimiento DGII</p>
          <p className="mt-0.5 font-display text-xl font-semibold text-accent-rd">Activo</p>
        </div>
      </div>
    </div>
  );
}
