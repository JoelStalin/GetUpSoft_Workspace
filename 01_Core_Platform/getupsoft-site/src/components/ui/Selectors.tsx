import React from "react";
import { RegionPill } from "./Button";

// ============================================================================
// REGION SELECTOR — Global / RD toggle
// ============================================================================

interface RegionSelectorProps {
  value?: "global" | "rd";
  onChange?: (region: "global" | "rd") => void;
  className?: string;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  value = "global",
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${className}`.trim()}
      role="group"
      aria-label="Region selector"
    >
      <RegionPill
        isActive={value === "global"}
        label="Global"
        onClick={() => onChange?.("global")}
      />
      <RegionPill
        isActive={value === "rd"}
        label="RD"
        onClick={() => onChange?.("rd")}
      />
    </div>
  );
};

// ============================================================================
// LANGUAGE SELECTOR — EN / ES toggle
// ============================================================================

interface LanguageSelectorProps {
  value?: "en" | "es";
  onChange?: (language: "en" | "es") => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value = "en",
  onChange,
  className = "",
}) => {
  const toggleLanguage = () => {
    onChange?.(value === "es" ? "en" : "es");
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-full border border-border text-text-muted hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-180 focus:outline-offset-2 focus:outline-2 focus:outline-primary ${className}`.trim()}
      aria-label="Toggle language"
      aria-pressed={value === "en"}
      role="switch"
    >
      <span className={value === "en" ? "text-primary font-bold" : ""}>EN</span>
      <span className="text-border-strong">/</span>
      <span className={value === "es" ? "text-primary font-bold" : ""}>ES</span>
    </button>
  );
};

// ============================================================================
// SELECTOR GROUP — Convenience component for header placement
// ============================================================================

interface SelectorGroupProps {
  region?: "global" | "rd";
  language?: "en" | "es";
  onRegionChange?: (region: "global" | "rd") => void;
  onLanguageChange?: (language: "en" | "es") => void;
  className?: string;
}

export const SelectorGroup: React.FC<SelectorGroupProps> = ({
  region = "global",
  language = "en",
  onRegionChange,
  onLanguageChange,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-4 ${className}`.trim()}
      role="group"
      aria-label="Selectors"
    >
      <RegionSelector value={region} onChange={onRegionChange} />
      <LanguageSelector value={language} onChange={onLanguageChange} />
    </div>
  );
};
