import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { PortalProvider } from "./context/PortalContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { router } from "./routes";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider defaultLanguage="es">
      <PortalProvider>
        <RouterProvider router={router} />
      </PortalProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
