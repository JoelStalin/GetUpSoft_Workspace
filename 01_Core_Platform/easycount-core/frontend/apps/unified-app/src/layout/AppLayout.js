import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/auth-provider';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Package, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@getupsoft/ui';
export const AppLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const navItems = [
        { label: 'Dashboard', icon: _jsx(LayoutDashboard, { className: "w-5 h-5" }), href: '/', roles: ['ADMIN', 'SOCIO', 'PARTNER'] },
        { label: 'Clientes', icon: _jsx(Users, { className: "w-5 h-5" }), href: '/clients', roles: ['ADMIN', 'PARTNER'] },
        { label: 'Facturación', icon: _jsx(CreditCard, { className: "w-5 h-5" }), href: '/billing', roles: ['ADMIN', 'SOCIO'] },
        { label: 'Productos', icon: _jsx(Package, { className: "w-5 h-5" }), href: '/products', roles: ['ADMIN', 'SOCIO', 'PARTNER'] },
        { label: 'Configuración', icon: _jsx(Settings, { className: "w-5 h-5" }), href: '/settings', roles: ['ADMIN'] },
    ];
    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));
    return (_jsxs("div", { className: "flex h-screen bg-black text-white font-sans overflow-hidden", children: [_jsxs("aside", { className: "w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col relative z-20", children: [_jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx("div", { className: "w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]", children: _jsx(ShieldCheck, { className: "w-5 h-5 text-black" }) }), _jsx("h1", { className: "text-xl font-black tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent italic", children: "EASYCOUNT" })] }), _jsx("div", { className: "h-[1px] w-full bg-gradient-to-r from-cyan-500/50 to-transparent" }), _jsx("p", { className: "text-[10px] text-zinc-600 mt-2 font-mono uppercase tracking-[0.3em]", children: "Sector_Secure_Node" })] }), _jsx("nav", { className: "flex-1 px-4 space-y-1.5", children: filteredNavItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (_jsxs(Link, { to: item.href, className: `flex items-center justify-between p-3.5 rounded-2xl transition-all group ${isActive
                                    ? 'bg-cyan-500/5 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]'
                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: `${isActive ? 'text-cyan-400' : 'text-zinc-600 group-hover:text-cyan-500'} transition-colors`, children: item.icon }), _jsx("span", { className: "text-sm font-bold tracking-tight uppercase", children: item.label })] }), isActive && _jsx(ChevronRight, { className: "w-4 h-4 animate-in slide-in-from-left-2" })] }, item.href));
                        }) }), _jsxs("div", { className: "p-6 border-t border-zinc-900 mt-auto bg-black/40 backdrop-blur-md", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6 px-2", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400 shadow-inner", children: user?.email?.charAt(0).toUpperCase() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-black text-zinc-200 truncate", children: user?.email }), _jsxs("p", { className: "text-[9px] font-mono text-cyan-500/70 uppercase tracking-tighter", children: [user?.role, "_OPERATOR"] })] })] }), _jsxs(Button, { onClick: handleLogout, variant: "ghost", className: "w-full justify-start space-x-3 h-12 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all", children: [_jsx(LogOut, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-bold uppercase tracking-widest", children: "Terminate_Session" })] })] })] }), _jsx("main", { className: "flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.03),transparent_40%)] relative", children: _jsxs("div", { className: "max-w-7xl mx-auto p-12 min-h-full flex flex-col", children: [_jsx(Outlet, {}), _jsx("footer", { className: "mt-auto pt-12 text-center", children: _jsx("p", { className: "text-[9px] font-mono text-zinc-800 uppercase tracking-[0.5em]", children: "System_Integrity: 100% | Encryption: AES-256-GCM | Node: EC-CORE-UNIFIED-V2" }) })] }) })] }));
};
