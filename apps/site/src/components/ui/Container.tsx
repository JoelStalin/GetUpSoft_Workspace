export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`mx-auto max-w-7xl px-6 ${className || ""}`}>
      {children}
    </div>
  );
}
