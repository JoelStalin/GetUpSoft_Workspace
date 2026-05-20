import { useEffect, useState, useRef } from "react";
import anime from "animejs";

interface CounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function Counter({ value, duration = 2000, suffix = "", className }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true;
          const obj = { n: 0 };
          anime({
            targets: obj,
            n: value,
            round: 1,
            easing: "easeOutExpo",
            duration: duration,
            update: () => setCount(obj.n),
          });
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref} className={className}>{count}{suffix}</span>;
}
