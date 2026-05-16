import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { MFA } from './pages/MFA';
import { Billing } from './pages/Billing';
import { Clients } from './pages/Clients';
import { Settings } from './pages/Settings';
import { Products } from './pages/Products';
import { useAuthStore } from './store/auth-store';
const ProtectedRoute = ({ children }) => {
    const user = useAuthStore((state) => state.user);
    const hydrated = useAuthStore((state) => state.hydrated);
    if (!hydrated)
        return null;
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
};
export const router = createBrowserRouter([
    {
        path: '/',
        element: (_jsx(ProtectedRoute, { children: _jsx(AppLayout, {}) })),
        children: [
            {
                index: true,
                element: _jsx(Dashboard, {}),
            },
            {
                path: 'clients',
                element: _jsx(Clients, {}),
            },
            {
                path: 'billing',
                element: _jsx(Billing, {}),
            },
            {
                path: 'products',
                element: _jsx(Products, {}),
            },
            {
                path: 'settings',
                element: _jsx(Settings, {}),
            },
        ],
    },
    {
        path: '/login',
        element: _jsx(Login, {}),
    },
    {
        path: '/mfa',
        element: _jsx(MFA, {}),
    },
]);
