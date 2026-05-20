export function Section({ 
  className, 
  children,
  background = "background"
}: { 
  className?: string; 
  children: React.ReactNode;
  background?: "background" | "surface" | "surfaceElevated" | "primarySoft" | "accentTealSoft"
}) {
  const bgStyles = {
    background: "bg-background",
    surface: "bg-surface",
    surfaceElevated: "bg-surfaceElevated",
    primarySoft: "bg-primarySoft",
    accentTealSoft: "bg-accentTealSoft",
  };

  return (
    <section className={`py-28 sm:py-36 lg:py-44 ${bgStyles[background]} ${className || ""}`}>
      {children}
    </section>
  );
}
