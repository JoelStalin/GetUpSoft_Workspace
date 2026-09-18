import React, { createContext, useState, useEffect, ReactNode } from "react";
import contentES from "../content/site.es";
import contentEN from "../content/site.en";

export type Language = "es" | "en";

interface LanguageContextType {
  language: typeof contentES;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = "es",
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const [language, setLanguageContent] = useState(contentES);

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Update content when language changes
  useEffect(() => {
    const content = currentLanguage === "es" ? contentES : contentEN;
    setLanguageContent(content);
    localStorage.setItem("language", currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguage,
        setLanguage: setCurrentLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
