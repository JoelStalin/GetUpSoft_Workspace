import { useEffect, useRef } from "react";
import anime from "animejs";

/**
 * Stagger-fade a list of child elements when the container scrolls into view.
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

    const { childSelector = ":scope > *", delay = 0, duration = 800, translateY = 30 } = options;

    const targets = el.querySelectorAll(childSelector);
    if (!targets.length) return;

    // Set initial state via anime.set to ensure it's in the system
    anime.set(targets, {
      opacity: 0,
      translateY: translateY
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true;
          anime({
            targets: targets,
            opacity: [0, 1],
            translateY: [translateY, 0],
            duration: duration,
            delay: anime.stagger(100, { start: delay }),
            easing: "easeOutQuart",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.childSelector, options.delay, options.duration, options.translateY]);

  return ref;
}
