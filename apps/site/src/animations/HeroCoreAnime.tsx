import { useEffect, useRef } from "react";
import anime from "animejs";

const NODES = [
  { label: "AI Agents", x: 200, y: 60, color: "#8B5CF6" },
  { label: "ERP", x: 340, y: 130, color: "#3B82F6" },
  { label: "CRM", x: 340, y: 230, color: "#14B8A6" },
  { label: "BI", x: 200, y: 300, color: "#10B981" },
  { label: "Infra", x: 60, y: 230, color: "#8B5CF6" },
  { label: "Data", x: 60, y: 130, color: "#3B82F6" },
];

const CENTER = { x: 200, y: 180 };

export function HeroCoreAnime() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lines = svg.querySelectorAll(".data-line");
    const nodeCircles = svg.querySelectorAll("circle.node-bg");
    const coreRing = svg.querySelector(".core-ring");

    // Reset
    anime.set(lines, { strokeDashoffset: anime.setDashoffset, opacity: 0 });
    anime.set(nodeCircles, { scale: 0, opacity: 0 });

    const tl = anime.timeline({
      easing: 'easeOutExpo',
      duration: 1000
    });

    tl.add({
      targets: coreRing,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1500,
      easing: 'easeInOutSine'
    })
    .add({
      targets: lines,
      strokeDashoffset: [anime.setDashoffset, 0],
      opacity: [0, 0.4],
      delay: anime.stagger(100),
      duration: 800
    }, '-=1000')
    .add({
      targets: nodeCircles,
      scale: [0, 1],
      opacity: [0, 1],
      delay: anime.stagger(80),
      duration: 600
    }, '-=500');

    // Continuous pulses
    anime({
      targets: '.pulse-dot',
      scale: [1, 1.5],
      opacity: [0.5, 0],
      duration: 2000,
      loop: true,
      easing: 'easeOutSine',
      delay: anime.stagger(400)
    });

    return () => {
        anime.remove(lines);
        anime.remove(nodeCircles);
        anime.remove('.pulse-dot');
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 420, height: 380 }}>
      <svg
        ref={svgRef}
        viewBox="0 0 400 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={155}
          stroke="rgba(15,23,42,0.05)"
          strokeWidth="1"
          className="core-ring"
        />

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
            opacity="0"
          />
        ))}

        <circle cx={CENTER.x} cy={CENTER.y} r={20} fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
        
        <g ref={nodesRef}>
          {NODES.map((node, i) => (
            <g key={node.label}>
              <circle className="pulse-dot" cx={node.x} cy={node.y} r={12} fill={node.color} opacity="0" />
              <circle className="node-bg" cx={node.x} cy={node.y} r={8} fill="#FFFFFF" stroke={node.color} strokeWidth="1.5" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
