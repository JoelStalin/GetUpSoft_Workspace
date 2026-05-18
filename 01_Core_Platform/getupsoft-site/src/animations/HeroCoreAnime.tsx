/**
 * GetUpSoft Global — Hero Core Visual
 * Powered by anime.js v4: SVG path draw, node pulse, data-line flow, stagger orbit
 */
import { useEffect, useRef } from "react";
import { animate, stagger, createTimeline } from "animejs";

const NODES = [
  { label: "AI Agents", x: 200, y: 60, color: "#A5B4FC" },
  { label: "ERP", x: 340, y: 130, color: "#C084FC" },
  { label: "CRM", x: 340, y: 230, color: "#67E8F9" },
  { label: "BI", x: 200, y: 300, color: "#6EE7B7" },
  { label: "Infra", x: 60, y: 230, color: "#F0ABFC" },
  { label: "Data", x: 60, y: 130, color: "#FDE68A" },
];

const CENTER = { x: 200, y: 180 };

export function HeroCoreAnime() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const nodesG = nodesRef.current;
    if (!svg || !nodesG) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Grab all path lines
    const lines = svg.querySelectorAll<SVGLineElement>(".data-line");
    const pulses = svg.querySelectorAll<SVGCircleElement>(".pulse-dot");
    const nodeCircles = nodesG.querySelectorAll<SVGCircleElement>("circle.node-bg");
    const nodeLabels = nodesG.querySelectorAll<SVGTextElement>("text.node-label");
    const coreRing = svg.querySelector<SVGCircleElement>(".core-ring");
    const coreRingInner = svg.querySelector<SVGCircleElement>(".core-ring-inner");

    if (prefersReduced) {
      // Show everything static immediately
      lines.forEach((l) => { l.style.opacity = "0.4"; });
      pulses.forEach((p) => { p.style.opacity = "1"; });
      nodeCircles.forEach((c) => { c.style.opacity = "1"; });
      nodeLabels.forEach((t) => { t.style.opacity = "1"; });
      return;
    }

    // Draw lines in with strokeDashoffset
    lines.forEach((line) => {
      const len = line.getTotalLength?.() ?? 150;
      line.style.strokeDasharray = `${len}`;
      line.style.strokeDashoffset = `${len}`;
      line.style.opacity = "0";
    });

    nodeCircles.forEach((c) => { c.style.opacity = "0"; c.style.transform = "scale(0)"; c.style.transformOrigin = "center"; });
    nodeLabels.forEach((t) => { t.style.opacity = "0"; });

    const tl = createTimeline({ defaults: { ease: "easeOutExpo" } });

    // 1. Core ring draw
    if (coreRing) {
      const len = coreRing.getTotalLength?.() ?? 400;
      coreRing.style.strokeDasharray = `${len}`;
      coreRing.style.strokeDashoffset = `${len}`;
      tl.add(coreRing, { strokeDashoffset: [len, 0], duration: 1000, easing: "easeInOutQuart" }, 0);
    }
    if (coreRingInner) {
      const len2 = coreRingInner.getTotalLength?.() ?? 280;
      coreRingInner.style.strokeDasharray = `${len2}`;
      coreRingInner.style.strokeDashoffset = `${len2}`;
      tl.add(coreRingInner, { strokeDashoffset: [len2, 0], duration: 800, easing: "easeInOutQuart" }, 200);
    }

    // 2. Lines draw in with stagger
    tl.add(
      lines,
      {
        strokeDashoffset: [null, 0],
        opacity: [0, 0.5],
        duration: 600,
        delay: stagger(100),
      },
      600,
    );

    // 3. Nodes pop in
    tl.add(
      nodeCircles,
      {
        opacity: [0, 1],
        scale: [0, 1],
        duration: 400,
        delay: stagger(80),
      },
      900,
    );

    // 4. Labels fade in
    tl.add(
      nodeLabels,
      {
        opacity: [0, 1],
        duration: 300,
        delay: stagger(60),
      },
      1200,
    );

    // 5. Continuous pulse on the dots
    pulses.forEach((pulse, i) => {
      pulse.style.opacity = "0";
      animate(pulse, {
        opacity: [0, 0.8, 0],
        scale: [0.5, 1.8, 0.5],
        duration: 2000 + i * 200,
        delay: i * 400,
        loop: true,
        easing: "easeInOutSine",
      });
    });

    // 6. Slow orbit rotation on the outer ring
    if (coreRing) {
      animate(coreRing, {
        rotate: 360,
        duration: 20000,
        loop: true,
        easing: "linear",
      });
    }
    if (coreRingInner) {
      animate(coreRingInner, {
        rotate: -360,
        duration: 14000,
        loop: true,
        easing: "linear",
      });
    }

    // 7. Data flow particles along paths — tiny circles sliding
    lines.forEach((line, i) => {
      const particle = svg.querySelector<SVGCircleElement>(`.particle-${i}`);
      if (!particle) return;
      const len = line.getTotalLength?.() ?? 150;
      animate(particle, {
        opacity: [0, 0.9, 0],
        strokeDashoffset: [len, 0],
        duration: 1800,
        delay: 1500 + i * 300,
        loop: true,
        easing: "easeInOutQuad",
      });
    });

    return () => {
      // anime.js v4 animations auto-cleanup on component unmount
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center" style={{ width: 420, height: 380 }}>
      <svg
        ref={svgRef}
        viewBox="0 0 400 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Outer ring */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={155}
          stroke="rgba(165,180,252,0.12)"
          strokeWidth="1"
          className="core-ring"
          style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
        />

        {/* Inner ring */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={110}
          stroke="rgba(165,180,252,0.08)"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="core-ring-inner"
          style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
        />

        {/* Connection lines from center to each node */}
        {NODES.map((node, i) => (
          <line
            key={node.label}
            className="data-line"
            x1={CENTER.x}
            y1={CENTER.y}
            x2={node.x}
            y2={node.y}
            stroke={node.color}
            strokeWidth="1"
            opacity="0.4"
          />
        ))}

        {/* Data flow particles (small circles riding the paths) */}
        {NODES.map((node, i) => {
          const dx = node.x - CENTER.x;
          const dy = node.y - CENTER.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          return (
            <circle
              key={`particle-${i}`}
              className={`particle-${i}`}
              cx={CENTER.x}
              cy={CENTER.y}
              r={2.5}
              fill={node.color}
              opacity={0}
            />
          );
        })}

        {/* Core glows */}
        <circle cx={CENTER.x} cy={CENTER.y} r={48} fill="rgba(165,180,252,0.06)" />
        <circle cx={CENTER.x} cy={CENTER.y} r={32} fill="rgba(165,180,252,0.10)" />

        {/* Core center */}
        <circle cx={CENTER.x} cy={CENTER.y} r={20} fill="#1C2028" stroke="#A5B4FC" strokeWidth="1.5" />
        <text
          x={CENTER.x}
          y={CENTER.y + 4}
          textAnchor="middle"
          fill="#A5B4FC"
          fontSize="8"
          fontFamily="IBM Plex Mono"
          fontWeight="500"
          letterSpacing="1"
        >
          CORE
        </text>

        {/* Node groups */}
        <g ref={nodesRef}>
          {NODES.map((node, i) => (
            <g key={node.label}>
              {/* Pulse ring */}
              <circle
                className="pulse-dot"
                cx={node.x}
                cy={node.y}
                r={14}
                fill="none"
                stroke={node.color}
                strokeWidth="1"
                opacity="0"
              />
              {/* Node bg */}
              <circle
                className="node-bg"
                cx={node.x}
                cy={node.y}
                r={9}
                fill="#1C2028"
                stroke={node.color}
                strokeWidth="1.5"
              />
              {/* Label */}
              <text
                className="node-label"
                x={node.x}
                y={node.y + (node.y < CENTER.y ? -16 : 22)}
                textAnchor="middle"
                fill={node.color}
                fontSize="8"
                fontFamily="IBM Plex Mono"
                fontWeight="500"
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Glass info card overlaid */}
      <div className="absolute bottom-0 right-0 glass rounded-2xl p-4 text-left shadow-xl" style={{ width: 160 }}>
        <p className="font-mono text-[9px] uppercase tracking-widest text-accent-global">Intelligence Core</p>
        <p className="mt-1.5 font-display text-sm font-semibold text-text-main">6 Systems</p>
        <p className="font-display text-sm font-semibold text-text-main">Connected</p>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <p className="font-mono text-[9px] text-text-muted">Active</p>
        </div>
      </div>
    </div>
  );
}
