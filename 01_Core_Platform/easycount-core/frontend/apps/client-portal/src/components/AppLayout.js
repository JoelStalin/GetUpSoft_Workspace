import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/use-auth";
import { TourController } from "../tours/TourController";
const NAV = [
    { to: "/dashboard", label: "Dashboard", permissions: ["TENANT_INVOICE_READ"] },
    { to: "/invoices", label: "Comprobantes", permissions: ["TENANT_INVOICE_READ"] },
    { to: "/plans", label: "Planes", permissions: ["TENANT_PLAN_VIEW", "TENANT_PLAN_UPGRADE"] },
    { to: "/assistant", label: "Asistente", permissions: ["TENANT_CHAT_ASSIST"] },
    { to: "/emit/ecf", label: "Emitir e-CF", permissions: ["TENANT_INVOICE_EMIT"] },
    { to: "/recurring-invoices", label: "Recurrentes", permissions: ["TENANT_RECURRING_INVOICE_MANAGE"] },
    { to: "/emit/rfce", label: "Emitir RFCE", permissions: ["TENANT_RFCE_SUBMIT"] },
    { to: "/approvals", label: "Aprobaciones", permissions: ["TENANT_APPROVAL_SEND"] },
    { to: "/certificates", label: "Certificados", permissions: ["TENANT_CERT_UPLOAD"] },
    { to: "/integrations/odoo", label: "API Odoo", permissions: ["TENANT_API_TOKEN_MANAGE"] },
    { to: "/profile", label: "Perfil", permissions: [] },
];
export function AppLayout() {
    const { logout, user, permissions } = useAuth();
    return (_jsxs("div", { className: "flex min-h-screen bg-background text-foreground", children: [_jsxs("aside", { className: "hidden w-64 border-r border-border bg-surface/95 backdrop-blur-xl p-6 md:block", children: [_jsxs("div", { className: "mb-10 space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10", children: _jsxs("svg", { viewBox: "0 0 200 200", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-full h-full", children: [_jsx("rect", { x: "50", y: "50", width: "100", height: "100", rx: "24", stroke: "#99F6E4", "stroke-width": "14" }), _jsx("path", { d: "M80 100L95 120L125 85", stroke: "#99F6E4", "stroke-width": "14", "stroke-linecap": "round", "stroke-linejoin": "round" })] }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-display font-semibold text-white tracking-wider uppercase", children: "EasyCounting" }), _jsx("p", { className: "text-[9px] uppercase tracking-[0.3em] text-primary/60 font-bold", children: "Client Portal" })] })] }), _jsx("div", { className: "h-px bg-gradient-to-r from-primary/20 via-transparent to-transparent" })] }), _jsx("nav", { className: "space-y-1 text-[13px] font-medium", "data-tour": "portal-nav", children: NAV.filter((item) => item.permissions.length === 0 || item.permissions.some((perm) => permissions.includes(perm))).map((item) => (_jsx(NavLink, { to: item.to, className: ({ isActive }) => `block rounded-md px-3 py-2 transition ${isActive ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground hover:bg-white/5"}`, children: item.label }, item.to))) })] }), _jsxs("main", { className: "flex-1", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border bg-background/60 backdrop-blur px-6 py-4", children: [_jsxs("div", { "data-tour": "session-user", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.2em] text-muted", children: "Portal sesi\u00F3n" }), _jsx("p", { className: "text-sm font-medium text-foreground opacity-90", children: user?.email ?? "sin sesion" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(TourController, {}), _jsx("button", { onClick: logout, className: "rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:border-primary hover:text-primary transition-all", children: "Salir" })] })] }), _jsx("div", { className: "px-6 py-8", children: _jsx(Outlet, {}) })] })] }));
}
