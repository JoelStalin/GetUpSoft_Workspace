import { useEffect, useState } from "react";

type FlowMediaProps = {
  mp4?: string;
  webm?: string;
  poster?: string;
  fallbackImage?: string;
  alt: string;
  className?: string;
  priority?: "high" | "lazy";
};

export function FlowMedia({
  mp4,
  webm,
  poster,
  fallbackImage,
  alt,
  className = "",
  priority = "lazy",
}: FlowMediaProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const imageSrc = poster ?? fallbackImage;

  if (reducedMotion || videoFailed || (!mp4 && !webm)) {
    if (!imageSrc) {
      return <div className={`flow-media-placeholder ${className}`} role="img" aria-label={alt} />;
    }

    return (
      <img
        src={imageSrc}
        alt={alt}
        loading={priority === "high" ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <video
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload={priority === "high" ? "metadata" : "none"}
      aria-label={alt}
      onError={() => setVideoFailed(true)}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      {mp4 ? <source src={mp4} type="video/mp4" /> : null}
      {imageSrc ? <img src={imageSrc} alt={alt} /> : null}
    </video>
  );
}
