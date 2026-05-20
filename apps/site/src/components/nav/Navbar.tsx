import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { CodeLogo } from "../CodeLogo";
import { Button } from "../ui/Button";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

interface NavbarProps {
  variant?: "global" | "rd";
  items: NavItem[];
  ctaLabel: string;
  ctaTo: string;
}

export function Navbar({ variant = "global", items, ctaLabel, ctaTo }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const accentColor = variant === "rd" ? "text-accentTeal" : "text-primary";
  const activeColor = variant === "rd" ? "accentTeal" : "primary";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-border py-3 shadow-soft-xl"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-8 flex items-center justify-between gap-12">
        {/* Logo Section */}
        <NavLink to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <CodeLogo variant={variant} />
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-300 ${
                  isActive
                    ? accentColor
                    : isScrolled
                    ? "text-textMuted hover:text-text"
                    : "text-textMuted/80 hover:text-text"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Utility / CTA Section */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 border-r border-border pr-6 mr-2">
             {/* Social placeholders could go here or in footer */}
          </div>
          <Button 
            to={ctaTo} 
            className={`!px-8 !py-3 !text-[10px] !tracking-[0.2em] transition-all duration-500 ${
              isScrolled ? "bg-text text-white shadow-soft-xl" : "bg-white text-text border border-border"
            }`}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </header>
  );
}
