import { Navigate, createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { HomePage } from "./pages/Home";
import { ProductsPage } from "./pages/Products";
import { AccountingManagementPage } from "./pages/AccountingManagement";
import { PlatformPage } from "./pages/Platform";
import { ContactPage } from "./pages/Contact";
import { ChatbotPortalPage } from "./pages/ChatbotPortal";

const isChatbotHost =
  typeof window !== "undefined" && /^chatbot\./i.test(window.location.hostname);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: isChatbotHost ? <ChatbotPortalPage /> : <HomePage /> },
      { path: "productos", element: <ProductsPage /> },
      { path: "productos/easycount", element: <AccountingManagementPage /> },
      { path: "productos/accounting-management", element: <Navigate to="/productos/easycount" replace /> },
      { path: "plataforma", element: <PlatformPage /> },
      { path: "contacto", element: <ContactPage /> },
      { path: "chatbot", element: <ChatbotPortalPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
