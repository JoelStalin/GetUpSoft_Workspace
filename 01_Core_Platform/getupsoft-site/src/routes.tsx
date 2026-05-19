import { Navigate, createBrowserRouter } from "react-router-dom";
import { GlobalLayout } from "./components/GlobalLayout";
import { RDLayout } from "./components/RDLayout";
import { SiteLayout } from "./components/SiteLayout";
import { GlobalHomePage } from "./pages/global/Home";
import { RDHomePage } from "./pages/rd/Home";
import { PortalContentPage } from "./components/PortalContentPage";
import { HomePage as LegacyHomePage } from "./pages/Home";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
// Legacy pages kept for backward compat
import { ProductsPage as LegacyProductsPage } from "./pages/Products";
import { AccountingManagementPage } from "./pages/AccountingManagement";
import { PlatformPage } from "./pages/Platform";
import { ChatbotPortalPage } from "./pages/ChatbotPortal";

// Redesigned pages (Phase 2-3)
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { SolutionsPage } from "./pages/SolutionsPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { DiagnosticPage } from "./pages/DiagnosticPage";

const host = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
const isRDHost = host.endsWith(".com.do") || host === "getupsoft.com.do";
const isChatbotHost = /^chatbot\./i.test(host);

const globalPageData = {
  "ai-agents": {
    title: "Enterprise AI Agents",
    subtitle: "Autonomous agents for workflow orchestration, cognitive analysis, natural language operations and executive intelligence.",
    blocks: ["Workflow Orchestration", "Agentic Memory", "Decision Support"],
  },
  "system-integration": {
    title: "System Integration",
    subtitle: "ERP, CRM, BI, accounting, inventory, e-commerce, APIs and legacy systems connected through governed architecture.",
    blocks: ["Integration Contracts", "Data Orchestration", "Legacy Modernization"],
  },
  "digital-transformation": {
    title: "Digital Transformation",
    subtitle: "Practical modernization that closes the gap between strategy and working software, infrastructure and automation.",
    blocks: ["Operating Model", "Automation Roadmap", "Delivery Governance"],
  },
  products: {
    title: "Products & Cases",
    subtitle: "Orca, AIHub, GetUpBuilder, Galantes Jewelry and chefalitas as a connected product and delivery ecosystem.",
    blocks: ["Orca", "AIHub", "GetUpBuilder"],
  },
  solutions: {
    title: "Enterprise Solutions",
    subtitle: "Operational intelligence for operations, sales, executive decision, BI governance, automation and AI strategy.",
    blocks: ["Operations", "BI Governance", "AI Strategy"],
  },
  "case-studies": {
    title: "Case Studies",
    subtitle: "Business outcomes across commerce, restaurant operations, AI orchestration and structured software delivery.",
    blocks: ["Galantes Jewelry", "chefalitas", "Delivery Systems"],
  },
  methodology: {
    title: "Methodology",
    subtitle: "A disciplined path from architecture audit to intelligence design and production delivery.",
    blocks: ["Audit", "Design", "Delivery"],
  },
  about: {
    title: "About GetUpSoft",
    subtitle: "An enterprise technology architecture company that connects strategy, engineering and operational execution.",
    blocks: ["Architecture", "Execution", "Governance"],
  },
  contact: {
    title: "Contact",
    subtitle: "Start a strategic session for AI agents, integrations, automation or enterprise modernization.",
    blocks: ["Scope", "Assessment", "Next Step"],
  },
};

const rdPageData = {
  "odoo-erp": {
    title: "Odoo ERP",
    subtitle: "Ventas, inventario, compras, contabilidad, CRM, POS, reportes y facturación electrónica integrados.",
    blocks: ["Ventas e Inventario", "Contabilidad", "Dashboards"],
  },
  "facturacion-electronica": {
    title: "Facturación Electrónica DGII/e-CF",
    subtitle: "Flujo de emisión, validación, integración con Odoo y cumplimiento operativo para empresas dominicanas.",
    blocks: ["e-CF", "DGII", "Integración Odoo"],
  },
  infraestructura: {
    title: "Infraestructura Tecnológica",
    subtitle: "Racks, cableado estructurado, WiFi empresarial, servidores, seguridad, mantenimiento y monitoreo.",
    blocks: ["Servidores", "Cableado", "Continuidad"],
  },
  "redes-empresariales": {
    title: "Redes Empresariales",
    subtitle: "LAN, WiFi, segmentación, cobertura y estabilidad para oficinas, almacenes, tiendas y sucursales.",
    blocks: ["WiFi Empresarial", "LAN", "Monitoreo"],
  },
  servidores: {
    title: "Servidores",
    subtitle: "Infraestructura local e híbrida para aplicaciones, respaldos, Odoo, archivos y continuidad operativa.",
    blocks: ["Implementación", "Backups", "Mantenimiento"],
  },
  sectores: {
    title: "Sectores",
    subtitle: "Distribuidoras, retail, ferreterías, restaurantes, logística, servicios profesionales y empresas en crecimiento.",
    blocks: ["Retail", "Restaurantes", "Distribución"],
  },
  casos: {
    title: "Casos",
    subtitle: "Galantes Jewelry, chefalitas, Orca, AIHub y GetUpBuilder adaptados al mercado dominicano.",
    blocks: ["Galantes Jewelry", "chefalitas", "Ecosistema"],
  },
  nosotros: {
    title: "Nosotros",
    subtitle: "Visión tecnológica internacional con ejecución local en República Dominicana, soporte cercano y enfoque práctico.",
    blocks: ["Visión", "Soporte Local", "Ejecución"],
  },
  contacto: {
    title: "Contacto",
    subtitle: "Solicita un diagnóstico para Odoo ERP, facturación electrónica, redes, servidores o infraestructura.",
    blocks: ["Diagnóstico", "Servicio", "Implementación"],
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
      secondaryCta="Explore Methodology"
      secondaryTo="/methodology"
      blocks={data.blocks.map((title, i) => ({
        eyebrow: `Module 0${i + 1}`,
        title,
        body: "Structured implementation with clear ownership, observability, documentation and production-ready delivery.",
        items: ["Architecture-first planning", "Integration and automation design", "Secure deployment model"],
      }))}
      faq={[
        { q: "How does GetUpSoft start an engagement?", a: "We begin with an architecture and operations assessment, then define the highest-value implementation path." },
        { q: "Do you build production systems?", a: "Yes. The focus is working software, integrations, automation, infrastructure and governance." },
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
      primaryTo="/contacto"
      secondaryCta="Ver Servicios"
      secondaryTo="/odoo-erp"
      blocks={data.blocks.map((title, i) => ({
        eyebrow: `Área 0${i + 1}`,
        title,
        body: "Implementación práctica para empresas dominicanas que necesitan orden, visibilidad, cumplimiento y continuidad operativa.",
        items: ["Diagnóstico inicial", "Configuración e instalación", "Soporte y seguimiento"],
      }))}
      faq={[
        { q: "¿Trabajan con empresas fuera de Santo Domingo?", a: "Sí. Podemos atender operaciones en distintas zonas del país con soporte remoto, coordinación local y visitas según el alcance." },
        { q: "¿Pueden integrar Odoo con facturación electrónica?", a: "Sí. Diseñamos el flujo operativo para ventas, inventario, contabilidad, e-CF y procesos relacionados con DGII." },
      ]}
    />
  );
}

const globalRoutes = [
  {
    path: "/",
    element: <GlobalLayout />,
    children: [
      { index: true, element: <GlobalHomePage /> },
      { path: "ai-agents", element: globalPage("ai-agents") },
      { path: "system-integration", element: globalPage("system-integration") },
      { path: "digital-transformation", element: globalPage("digital-transformation") },
      { path: "products", element: globalPage("products") },
      { path: "solutions", element: globalPage("solutions") },
      { path: "case-studies", element: globalPage("case-studies") },
      { path: "methodology", element: globalPage("methodology") },
      { path: "about", element: globalPage("about") },
      { path: "contact", element: globalPage("contact") },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "terms", element: <TermsOfService /> },
      // Legacy redirects
      { path: "productos", element: <Navigate to="/products" replace /> },
      { path: "contacto", element: <Navigate to="/contact" replace /> },
    ],
  },
  // Redesigned website routes (Phase 2-3)
  {
    path: "/redesign",
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "solutions", element: <SolutionsPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "diagnostic", element: <DiagnosticPage /> },
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
      { path: "odoo-erp", element: rdPage("odoo-erp") },
      { path: "facturacion-electronica", element: rdPage("facturacion-electronica") },
      { path: "infraestructura", element: rdPage("infraestructura") },
      { path: "redes-empresariales", element: rdPage("redes-empresariales") },
      { path: "servidores", element: rdPage("servidores") },
      { path: "sectores", element: rdPage("sectores") },
      { path: "casos", element: rdPage("casos") },
      { path: "nosotros", element: rdPage("nosotros") },
      { path: "contacto", element: rdPage("contacto") },
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
