import React, { ReactNode } from "react";

// ============================================================================
// CONTAINER — Responsive wrapper with max-width and padding
// ============================================================================

interface ContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "container" | "container-xl";
  className?: string;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, maxWidth = "container-xl", className = "" }, ref) => {
    const maxWidthMap = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      container: "max-w-container",
      "container-xl": "max-w-container-xl",
    };

    return (
      <div
        ref={ref}
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthMap[maxWidth]} ${className}`.trim()}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

// ============================================================================
// SECTION — Full-width section wrapper with vertical padding
// ============================================================================

interface SectionProps {
  children: ReactNode;
  variant?: "default" | "soft" | "elevated";
  padding?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sectionVariants = {
  default: "bg-background", // Primary dark background
  soft: "bg-surface-soft", // Subtle lighter background
  elevated: "bg-surface", // Elevated surface
};

const sectionPadding = {
  sm: "py-12 sm:py-16", // Mobile: 48px, Desktop: 64px
  md: "py-16 sm:py-24", // Mobile: 64px, Desktop: 96px
  lg: "py-20 sm:py-28", // Mobile: 80px, Desktop: 112px
  xl: "py-24 sm:py-32 lg:py-40", // Mobile: 96px, Tablet: 128px, Desktop: 160px
};

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  (
    {
      children,
      variant = "default",
      padding = "lg",
      className = "",
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={`w-full ${sectionVariants[variant]} ${sectionPadding[padding]} ${className}`.trim()}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

// ============================================================================
// EYEBROW — Pre-heading label (small, uppercase, tracking-wide)
// ============================================================================

interface EyebrowProps {
  children: ReactNode;
  color?: "muted" | "primary" | "text";
  className?: string;
}

const eyebrowColors = {
  muted: "text-text-muted",
  primary: "text-primary",
  text: "text-text",
};

export const Eyebrow = React.forwardRef<HTMLDivElement, EyebrowProps>(
  ({ children, color = "primary", className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`text-eyebrow font-semibold uppercase tracking-wide mb-3 ${eyebrowColors[color]} ${className}`.trim()}
      >
        {children}
      </div>
    );
  }
);

Eyebrow.displayName = "Eyebrow";

// ============================================================================
// SECTION HEADING COMBO — Eyebrow + H2 (common pattern)
// ============================================================================

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  alignment?: "left" | "center";
  className?: string;
}

export const SectionHeading = React.forwardRef<
  HTMLDivElement,
  SectionHeadingProps
>(
  (
    {
      eyebrow,
      title,
      subtitle,
      alignment = "left",
      className = "",
    },
    ref
  ) => {
    const alignClass = alignment === "center" ? "text-center" : "text-left";

    return (
      <div ref={ref} className={`${alignClass} ${className}`.trim()}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="text-h2-section text-text font-bold leading-tight mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-body-lg text-text-muted max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

SectionHeading.displayName = "SectionHeading";
