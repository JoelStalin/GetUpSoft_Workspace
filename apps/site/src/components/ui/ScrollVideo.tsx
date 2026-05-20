import { useEffect, useRef } from "react";

interface ScrollVideoProps {
  src: string;
  playbackRate?: number;
  className?: string;
}

export function ScrollVideo({ src, playbackRate = 1, className }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Preload metadata to get duration
    video.load();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollY / scrollHeight;
      
      if (video.duration > 0) {
        video.currentTime = video.duration * scrollFraction;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="auto"
      className={`fixed inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${className}`}
      style={{ 
        filter: "grayscale(100%) brightness(1.2) contrast(0.8)",
        opacity: 0.15,
        zIndex: -1 // Ensure it's behind everything
      }}
    />
  );
}
