export function Eyebrow({ 
  className, 
  children,
  color = "primary"
}: { 
  className?: string; 
  children: React.ReactNode;
  color?: "primary" | "accentTeal" | "accentPurple"
}) {
  const colorStyles = {
    primary: "text-primary",
    accentTeal: "text-accentTeal",
    accentPurple: "text-accentPurple",
  };

  return (
    <p className={`text-[12px] font-bold uppercase tracking-[0.2em] mb-6 ${colorStyles[color]} ${className || ""}`}>
      // {children}
    </p>
  );
}
