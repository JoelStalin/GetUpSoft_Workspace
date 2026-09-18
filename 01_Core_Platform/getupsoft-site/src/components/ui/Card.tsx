import React, { ReactNode } from "react";

// ============================================================================
// CARD — Generic card wrapper with border, surface background, hover effect
// ============================================================================

interface CardProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  isInteractive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      href,
      onClick,
      className = "",
      isInteractive = true,
    },
    ref
  ) => {
    const baseStyles =
      "bg-surface border border-border rounded-lg p-6 transition-all duration-180";

    const hoverStyles = isInteractive
      ? "hover:border-border-strong hover:-translate-y-1 hover:shadow-card-hover"
      : "";

    const interactiveClass = isInteractive ? "cursor-pointer" : "";

    const combinedClassName = `${baseStyles} ${hoverStyles} ${interactiveClass} ${className}`.trim();

    if (href) {
      return (
        <a href={href} className={combinedClassName} ref={ref as any}>
          {children}
        </a>
      );
    }

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={combinedClassName}
        role={onClick ? "button" : undefined}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// ============================================================================
// SERVICE CARD — Icon + Title + Description + CTA
// ============================================================================

interface ServiceCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ icon, title, description, cta, className = "" }, ref) => {
    return (
      <Card ref={ref} className={className}>
        {icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}

        <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>

        <p className="text-body text-text-muted mb-4">{description}</p>

        {cta && (
          <a
            href={cta.href || "#"}
            onClick={cta.onClick}
            className="inline-flex text-sm font-semibold text-primary hover:text-primary-strong transition-colors"
          >
            {cta.label}
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        )}
      </Card>
    );
  }
);

ServiceCard.displayName = "ServiceCard";

// ============================================================================
// PRODUCT CARD — Product name/logo + features + status badge + CTA
// ============================================================================

interface ProductCardProps {
  productName: string;
  features: string[];
  status?: "production" | "coming-soon" | "beta";
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  className?: string;
}

const statusBadgeStyles = {
  production: "bg-success/20 text-success",
  "coming-soon": "bg-warning/20 text-warning",
  beta: "bg-accent-blue/20 text-accent-blue",
};

const statusBadgeText = {
  production: "In Production",
  "coming-soon": "Coming Soon",
  beta: "Beta",
};

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      productName,
      features,
      status = "production",
      ctaLabel = "Learn More",
      ctaHref = "#",
      ctaOnClick,
      className = "",
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={className}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{productName}</h3>
          {status && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-md ${statusBadgeStyles[status]}`}
            >
              {statusBadgeText[status]}
            </span>
          )}
        </div>

        <ul className="space-y-2 mb-6">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span className="text-sm text-text-muted">{feature}</span>
            </li>
          ))}
        </ul>

        <a
          href={ctaHref}
          onClick={ctaOnClick}
          className="inline-flex text-sm font-semibold text-primary hover:text-primary-strong transition-colors"
        >
          {ctaLabel}
          <span className="ml-2">→</span>
        </a>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

// ============================================================================
// INDUSTRY CARD — Similar to ProductCard but for industries
// ============================================================================

interface IndustryCardProps {
  industryName: string;
  description: string;
  benefits: string[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  className?: string;
}

export const IndustryCard = React.forwardRef<HTMLDivElement, IndustryCardProps>(
  (
    {
      industryName,
      description,
      benefits,
      ctaLabel = "Request Solution",
      ctaHref = "#",
      ctaOnClick,
      className = "",
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={className}>
        <h3 className="text-lg font-semibold text-text mb-2">{industryName}</h3>

        <p className="text-sm text-text-muted mb-4">{description}</p>

        <ul className="space-y-2 mb-6">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span className="text-sm text-text-muted">{benefit}</span>
            </li>
          ))}
        </ul>

        <a
          href={ctaHref}
          onClick={ctaOnClick}
          className="inline-flex text-sm font-semibold text-primary hover:text-primary-strong transition-colors"
        >
          {ctaLabel}
          <span className="ml-2">→</span>
        </a>
      </Card>
    );
  }
);

IndustryCard.displayName = "IndustryCard";
