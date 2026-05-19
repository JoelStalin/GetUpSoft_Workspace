import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

// Hook to access current language content
export function useContent() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useContent must be used within LanguageProvider");
  }

  return context.language;
}

// Hook to get translated string from content
export function useTranslation(key: string): string {
  const content = useContent();
  const keys = key.split(".");
  let value: any = content;

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
