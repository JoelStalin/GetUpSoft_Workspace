import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * Stagger-fade a list of child elements when the container scrolls into view.
 * Uses IntersectionObserver so it fires once per mount.
 */
export function useScrollReveal<T extends HTMLElement>(
  options: {
    childSelector?: string;
    delay?: number;
    duration?: number;
    translateY?: number;
  } = {},
) {
  const ref = useRef<T>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const { childSelector = ":scope > *", delay = 0, duration = 700, translateY = 24 } = options;

    const targets = el.querySelectorAll<HTMLElement>(childSelector);
    if (!targets.length) return;

    // Set initial state
    targets.forEach((t) => {
      t.style.opacity = "0";
      t.style.transform = `translateY(${translateY}px)`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true;
          animate(targets, {
            opacity: [0, 1],
            translateY: [translateY, 0],
            duration,
            delay: stagger(80, { start: delay }),
            ease: "easeOutQuart",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Animate progress bars to their target width on scroll-into-view.
 * Target elements must have data-progress="<0-100>" attribute.
 */
export function useProgressReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Instant fill without animation
      el.querySelectorAll<HTMLElement>("[data-progress]").forEach((bar) => {
        bar.style.width = `${bar.dataset.progress}%`;
      });
      return;
    }

    const bars = el.querySelectorAll<HTMLElement>("[data-progress]");
    bars.forEach((b) => (b.style.width = "0%"));

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true;
          bars.forEach((bar, i) => {
            animate(bar, {
              width: [`0%`, `${bar.dataset.progress}%`],
              duration: 900,
              delay: i * 120,
              ease: "easeOutExpo",
            });
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Continuous float animation for decorative elements (nodes, badges).
 * Returns a ref to attach to the container; applies to each direct child with a stagger.
 */
export function useFloatAnimation<T extends HTMLElement>(amplitude = 8, period = 2800) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const targets = el.querySelectorAll<HTMLElement>(":scope > *");

    const anim = animate(targets, {
      translateY: [-amplitude / 2, amplitude / 2],
      duration: period,
      delay: stagger(300),
      direction: "alternate",
      loop: true,
      ease: "easeInOutSine",
    });

    return () => { anim.pause(); };
  }, []);

  return ref;
}

/**
 * Draws SVG path elements on scroll into view.
 */
export function useSVGDrawReveal<T extends SVGSVGElement>() {
  const ref = useRef<T>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const paths = el.querySelectorAll<SVGPathElement | SVGLineElement | SVGCircleElement>(
      "path, line, circle, polyline",
    );

    // Set initial stroke-dasharray / dashoffset via inline style
    paths.forEach((p) => {
      try {
        const len = (p as SVGGeometryElement).getTotalLength?.() ?? 200;
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      } catch {
        // non-geometry elements — skip
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true;
          animate(paths, {
            strokeDashoffset: [null, 0],
            duration: 1200,
            delay: stagger(150),
            ease: "easeInOutQuart",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
