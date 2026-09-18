import { createContext, useContext, useMemo } from "react";

export type Portal = "global" | "rd";
export type Lang = "en" | "es";

interface PortalCtx {
  portal: Portal;
  lang: Lang;
  accentClass: string;
  accentColor: string;
}

const Ctx = createContext<PortalCtx>({
  portal: "global",
  lang: "en",
  accentClass: "text-accent-global",
  accentColor: "#A5B4FC",
});

function detectPortal(): { portal: Portal; lang: Lang } {
  if (typeof window === "undefined") return { portal: "global", lang: "en" };
  const host = window.location.hostname.toLowerCase();
  if (host.endsWith(".com.do") || host === "getupsoft.com.do") {
    return { portal: "rd", lang: "es" };
  }
  return { portal: "global", lang: "en" };
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const { portal, lang } = useMemo(detectPortal, []);
  const value: PortalCtx = useMemo(
    () => ({
      portal,
      lang,
      accentClass: portal === "rd" ? "text-accent-rd" : "text-accent-global",
      accentColor: portal === "rd" ? "#99F6E4" : "#A5B4FC",
    }),
    [portal, lang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePortal = () => useContext(Ctx);
