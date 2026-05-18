import { Navigate, createBrowserRouter } from "react-router-dom";
import { GlobalLayout } from "./components/GlobalLayout";
import { RDLayout } from "./components/RDLayout";
import { SiteLayout } from "./components/SiteLayout";
import { GlobalHomePage } from "./pages/global/Home";
import { RDHomePage } from "./pages/rd/Home";
// Legacy pages kept for backward compat
import { ProductsPage } from "./pages/Products";
import { AccountingManagementPage } from "./pages/AccountingManagement";
import { PlatformPage } from "./pages/Platform";
import { ContactPage } from "./pages/Contact";
import { ChatbotPortalPage } from "./pages/ChatbotPortal";

const host = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
const isRDHost = host.endsWith(".com.do") || host === "getupsoft.com.do";
const isChatbotHost = /^chatbot\./i.test(host);

// Placeholder for pages not yet implemented
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Coming Soon</p>
      <h1 className="font-display text-4xl font-light text-text-main">{title}</h1>
      <p className="text-text-muted">This page is being built. Check back soon.</p>
    </div>
  );
}

function ComingSoonES({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Próximamente</p>
      <h1 className="font-display text-4xl font-light text-text-main">{title}</h1>
      <p className="text-text-muted">Esta página está siendo construida.</p>
    </div>
  );
}

const globalRoutes = [
  {
    path: "/",
    element: <GlobalLayout />,
    children: [
      { index: true, element: <GlobalHomePage /> },
      { path: "ai-agents", element: <ComingSoon title="AI Agents" /> },
      { path: "system-integration", element: <ComingSoon title="System Integration" /> },
      { path: "digital-transformation", element: <ComingSoon title="Digital Transformation" /> },
      { path: "products", element: <ComingSoon title="Products" /> },
      { path: "solutions", element: <ComingSoon title="Solutions" /> },
      { path: "case-studies", element: <ComingSoon title="Case Studies" /> },
      { path: "methodology", element: <ComingSoon title="Methodology" /> },
      { path: "about", element: <ComingSoon title="About" /> },
      { path: "contact", element: <ComingSoon title="Contact" /> },
      // Legacy redirects
      { path: "productos", element: <Navigate to="/products" replace /> },
      { path: "contacto", element: <Navigate to="/contact" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

const rdRoutes = [
  {
    path: "/",
    element: <RDLayout />,
    children: [
      { index: true, element: <RDHomePage /> },
      { path: "odoo-erp", element: <ComingSoonES title="Odoo ERP" /> },
      { path: "facturacion-electronica", element: <ComingSoonES title="Facturación Electrónica" /> },
      { path: "infraestructura", element: <ComingSoonES title="Infraestructura" /> },
      { path: "redes-empresariales", element: <ComingSoonES title="Redes Empresariales" /> },
      { path: "servidores", element: <ComingSoonES title="Servidores" /> },
      { path: "sectores", element: <ComingSoonES title="Sectores" /> },
      { path: "casos", element: <ComingSoonES title="Casos" /> },
      { path: "nosotros", element: <ComingSoonES title="Nosotros" /> },
      { path: "contacto", element: <ComingSoonES title="Contacto" /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

const legacyRoutes = [
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <ChatbotPortalPage /> },
      { path: "chatbot", element: <ChatbotPortalPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export const router = createBrowserRouter(
  isChatbotHost ? legacyRoutes : isRDHost ? rdRoutes : globalRoutes,
);
