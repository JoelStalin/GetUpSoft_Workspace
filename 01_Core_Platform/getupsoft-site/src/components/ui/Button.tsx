import React, { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "warning" | "region-pill";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
  asLink?: boolean;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-[#061014] font-semibold uppercase tracking-wide rounded-full hover:shadow-glow-teal hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180",

  secondary:
    "bg-transparent border-2 border-border-strong text-text rounded-full hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180",

  ghost:
    "bg-transparent text-primary hover:text-primary-strong disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180",

  warning:
    "bg-warning text-white font-semibold rounded-full hover:shadow-glow-orange active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180",

  "region-pill":
    "bg-transparent text-text-muted px-2 py-1 rounded-full text-sm border border-border hover:border-primary hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      asLink = false,
      href,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "font-semibold inline-flex items-center justify-center gap-2 focus:outline-offset-2 focus:outline-2 focus:outline-primary transition-all duration-180";

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

    // Loading spinner (minimal SVG)
    const spinner = (
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const content = (
      <>
        {isLoading && spinner}
        {children}
      </>
    );

    if (asLink && href) {
      return (
        <a
          href={href}
          className={combinedClassName}
          role="button"
          aria-disabled={disabled || isLoading}
          onClick={(e) => {
            if (disabled || isLoading) e.preventDefault();
          }}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

// Icon-only button variant with automatic aria-label enforcement
interface IconButtonProps extends Omit<ButtonProps, "children"> {
  icon: ReactNode;
  ariaLabel: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ariaLabel, variant = "ghost", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        aria-label={ariaLabel}
        className="h-10 w-10 rounded-full p-0"
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

// Region pill button (for Global/RD toggle)
interface RegionPillProps extends Omit<ButtonProps, "variant" | "children"> {
  isActive: boolean;
  label: string;
}

export const RegionPill = React.forwardRef<HTMLButtonElement, RegionPillProps>(
  ({ isActive, label, ...props }, ref) => {
    const activeClass = isActive
      ? "bg-primary/10 border-primary text-primary"
      : "bg-transparent border-border text-text-muted hover:border-primary hover:text-primary";

    return (
      <button
        ref={ref}
        className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-180 font-medium focus:outline-offset-2 focus:outline-2 focus:outline-primary ${activeClass}`}
        aria-pressed={isActive}
        {...props}
      >
        {label}
      </button>
    );
  }
);

RegionPill.displayName = "RegionPill";
