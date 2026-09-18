import { Navigate, createBrowserRouter } from "react-router-dom";
import { GlobalLayout } from "./components/GlobalLayout";
import { RDLayout } from "./components/RDLayout";
import { SiteLayout } from "./components/SiteLayout";
import { GlobalHomePage } from "./pages/global/Home";
import { RDHomePage } from "./pages/rd/Home";
import { PortalContentPage } from "./components/PortalContentPage";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { ContactPage } from "./pages/Contact";
import { ChatbotPortalPage } from "./pages/ChatbotPortal";

const globalPageData = {
  "ai-agents": {
    title: "Enterprise AI Agents",
    subtitle: "Autonomous agents for workflow orchestration, cognitive analysis, and executive intelligence.",
    blocks: ["Workflow Orchestration", "Agentic Memory", "Decision Support"],
  },
  "system-integration": {
    title: "System Integration",
    subtitle: "ERP, CRM, BI, and legacy systems connected through governed architecture.",
    blocks: ["Integration Contracts", "Data Orchestration", "Legacy Modernization"],
  },
  "digital-transformation": {
    title: "Digital Transformation",
    subtitle: "Modernization that closes the gap between strategy and working software.",
    blocks: ["Operating Model", "Automation Roadmap", "Delivery Governance"],
  },
  products: {
    title: "Products & Cases",
    subtitle: "Orca, AIHub, GetUpBuilder, and business cases as a connected ecosystem.",
    blocks: ["Orca", "AIHub", "GetUpBuilder"],
  },
  methodology: {
    title: "Methodology",
    subtitle: "A disciplined path from architecture audit to production delivery.",
    blocks: ["Audit", "Design", "Delivery"],
  },
  about: {
    title: "About GetUpSoft",
    subtitle: "Enterprise technology architecture company connecting strategy and execution.",
    blocks: ["Architecture", "Execution", "Governance"],
  },
};

const rdPageData = {
  "odoo-erp": {
    title: "Odoo ERP",
    subtitle: "Ventas, inventario, compras, contabilidad y facturación electrónica integrados.",
    blocks: ["Ventas e Inventario", "Contabilidad", "Dashboards"],
  },
  "facturacion-electronica": {
    title: "Facturación Electrónica DGII/e-CF",
    subtitle: "Flujo de emisión y cumplimiento operativo para empresas dominicanas.",
    blocks: ["e-CF", "DGII", "Integración Odoo"],
  },
  infraestructura: {
    title: "Infraestructura Tecnológica",
    subtitle: "Servidores, redes, seguridad y monitoreo para operaciones críticas.",
    blocks: ["Servidores", "Cableado", "Continuidad"],
  },
  sectores: {
    title: "Sectores",
    subtitle: "Distribuidoras, retail, logística y servicios profesionales en RD.",
    blocks: ["Retail", "Logística", "Distribución"],
  },
};

function globalPage(key: keyof typeof globalPageData) {
  const data = globalPageData[key];
  return (
    <PortalContentPage
      theme="global"
      title={data.title}
      subtitle={data.subtitle}
      primaryCta="Talk to an Architect"
      primaryTo="/contact"
      blocks={data.blocks.map((title, i) => ({
        eyebrow: `Module 0${i + 1}`,
        title,
        body: "Structured implementation with industrial discipline and production-ready delivery.",
        items: ["Architecture planning", "Integration design", "Secure deployment"],
      }))}
      faq={[
        { q: "How does GetUpSoft start?", a: "We begin with an architecture assessment." },
      ]}
    />
  );
}

function rdPage(key: keyof typeof rdPageData) {
  const data = rdPageData[key];
  return (
    <PortalContentPage
      theme="rd"
      title={data.title}
      subtitle={data.subtitle}
      primaryCta="Solicitar Diagnóstico"
      primaryTo="/es/contacto"
      blocks={data.blocks.map((title, i) => ({
        eyebrow: `Área 0${i + 1}`,
        title,
        body: "Implementación práctica para empresas que necesitan orden y cumplimiento.",
        items: ["Diagnóstico inicial", "Configuración", "Soporte"],
      }))}
      faq={[
        { q: "¿Atienden todo el país?", a: "Sí, operamos en toda República Dominicana." },
      ]}
    />
  );
}

export const router = createBrowserRouter([
  // Redirect root to /es
  { path: "/", element: <Navigate to="/es" replace /> },

  // Global / EN
  {
    path: "/en",
    element: <GlobalLayout />,
    children: [
      { index: true, element: <GlobalHomePage /> },
      { path: "ai-agents", element: globalPage("ai-agents") },
      { path: "system-integration", element: globalPage("system-integration") },
      { path: "digital-transformation", element: globalPage("digital-transformation") },
      { path: "products", element: globalPage("products") },
      { path: "methodology", element: globalPage("methodology") },
      { path: "about", element: globalPage("about") },
      { path: "contact", element: <ContactPage /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "terms", element: <TermsOfService /> },
    ],
  },

  // Global / ES
  {
    path: "/es",
    element: <GlobalLayout />,
    children: [
      { index: true, element: <GlobalHomePage /> },
      { path: "ai-agents", element: globalPage("ai-agents") },
      { path: "system-integration", element: globalPage("system-integration") },
      { path: "digital-transformation", element: globalPage("digital-transformation") },
      { path: "products", element: globalPage("products") },
      { path: "methodology", element: globalPage("methodology") },
      { path: "about", element: globalPage("about") },
      { path: "contacto", element: <ContactPage /> },
      
      // RD Sub-route
      {
        path: "rd",
        element: <RDLayout />,
        children: [
          { index: true, element: <RDHomePage /> },
          { path: "odoo-erp", element: rdPage("odoo-erp") },
          { path: "facturacion-electronica", element: rdPage("facturacion-electronica") },
          { path: "infraestructura", element: rdPage("infraestructura") },
          { path: "sectores", element: rdPage("sectores") },
        ]
      }
    ],
  },

  // Legacy / Chatbot
  {
    path: "/chatbot",
    element: <SiteLayout />,
    children: [
      { index: true, element: <ChatbotPortalPage /> },
    ],
  },

  { path: "*", element: <Navigate to="/es" replace /> },
]);
