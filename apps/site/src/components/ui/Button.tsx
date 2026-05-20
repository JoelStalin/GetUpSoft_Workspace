import { Link } from "react-router-dom";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  to?: string;
  href?: string;
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  to,
  href,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-text hover:shadow-soft-xl shadow-sm",
    secondary: "bg-primarySoft text-primary hover:bg-primary hover:text-white hover:shadow-soft-xl",
    outline: "bg-transparent border border-borderStrong text-text hover:bg-surface",
    ghost: "bg-transparent text-textMuted hover:text-primary hover:bg-surface/50",
  };

  const content = (
    <span className="flex items-center gap-2">
      {isLoading && (
        <svg className="animate-spin -ml-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className="flex items-center gap-1.5">
        {children}
        {variant === "ghost" && typeof children === "string" && children.includes("→") ? null : variant === "ghost" ? <span className="transition-transform duration-200 group-hover:translate-x-1">→</span> : null}
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={cn(baseStyles, variants[variant], className)}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={cn(baseStyles, variants[variant], className)} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button className={cn(baseStyles, variants[variant], className)} disabled={isLoading} {...props}>
      {content}
    </button>
  );
}

// Simple helper if not found
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
