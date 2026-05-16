import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const { user, hydrate, hydrated, clearSession } = useAuthStore();
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    const logout = () => {
        clearSession();
    };
    if (!hydrated) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center h-screen bg-black text-cyan-400 font-mono", children: [_jsxs("div", { className: "relative w-24 h-24 mb-8", children: [_jsx("div", { className: "absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" }), _jsx("div", { className: "absolute inset-2 rounded-full border-b-2 border-pink-500 animate-spin-slow" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "w-2 h-2 bg-white rounded-full animate-pulse" }) })] }), _jsxs("div", { className: "space-y-2 text-center", children: [_jsx("p", { className: "text-[10px] tracking-[0.5em] animate-pulse uppercase", children: "Initializing_Secure_Node" }), _jsx("div", { className: "w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden mx-auto", children: _jsx("div", { className: "h-full bg-cyan-500 animate-progress" }) })] })] }));
    }
    return (_jsx(AuthContext.Provider, { value: { user, logout, isLoading: !hydrated }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
