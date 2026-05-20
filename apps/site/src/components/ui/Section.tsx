export function Section({ 
  className, 
  children,
  background = "background"
}: { 
  className?: string; 
  children: React.ReactNode;
  background?: "background" | "surface" | "surfaceElevated" | "primarySoft" | "accentTealSoft" | "transparent"
}) {
  const bgStyles = {
    background: "bg-background/80 backdrop-blur-sm",
    surface: "bg-surface/90 backdrop-blur-md",
    surfaceElevated: "bg-surfaceElevated/90 backdrop-blur-md",
    primarySoft: "bg-primarySoft/80 backdrop-blur-md",
    accentTealSoft: "bg-accentTealSoft/80 backdrop-blur-md",
    transparent: "bg-transparent",
  };

  return (
    <section className={`py-28 sm:py-36 lg:py-44 ${bgStyles[background]} ${className || ""}`}>
      {children}
    </section>
  );
}
