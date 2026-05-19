import React, { useState } from "react";
import { RegionPill } from "./Button";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Productos", href: "#productos" },
  { label: "Soluciones", href: "#soluciones" },
  { label: "Recursos", href: "#recursos" },
  { label: "Precios", href: "#precios" },
  { label: "Contacto", href: "#contacto" },
];

interface HeaderProps {
  region?: "global" | "rd";
  language?: "es" | "en";
  onRegionChange?: (region: "global" | "rd") => void;
  onLanguageChange?: (language: "es" | "en") => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  region = "global",
  language = "es",
  onRegionChange,
  onLanguageChange,
  className = "",
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleRegionToggle = () => {
      const newRegion = region === "global" ? "rd" : "global";
      onRegionChange?.(newRegion);
    };

    const handleLanguageToggle = () => {
      const newLanguage = language === "es" ? "en" : "es";
      onLanguageChange?.(newLanguage);
    };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-surface border-b border-border backdrop-blur-md ${className}`.trim()}
    >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-container-xl">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary-strong transition-colors"
            >
              <svg
                className="w-8 h-8"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="4"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                />
                <rect
                  x="18"
                  y="4"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                  opacity="0.6"
                />
                <rect
                  x="4"
                  y="18"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                  opacity="0.6"
                />
                <rect
                  x="18"
                  y="18"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                  opacity="0.3"
                />
              </svg>
              GetUpSoft
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-text-muted hover:text-text transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right Section: Selectors + Mobile Menu Toggle */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Region Selector */}
              <RegionPill
                isActive={region === "global"}
                label={region === "global" ? "Global" : "RD"}
                onClick={handleRegionToggle}
                className="hidden sm:block"
              />

              {/* Language Selector */}
              <button
                onClick={handleLanguageToggle}
                className="px-3 py-1.5 text-xs font-semibold rounded-full border border-border text-text-muted hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-180 focus:outline-offset-2 focus:outline-2 focus:outline-primary"
                aria-label="Toggle language"
              >
                {language === "es" ? "ES" : "EN"}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-elevated transition-colors focus:outline-offset-2 focus:outline-2 focus:outline-primary"
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
              >
                <svg
                  className="w-6 h-6 text-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-border">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-2 py-3 text-sm text-text-muted hover:text-text hover:bg-surface-elevated transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Selectors */}
              <div className="flex items-center gap-2 px-2 py-3 border-t border-border mt-2 pt-4">
                <RegionPill
                  isActive={region === "global"}
                  label={region === "global" ? "Global" : "RD"}
                  onClick={handleRegionToggle}
                />
              </div>
            </nav>
          )}
        </div>
      </header>
    );
};
