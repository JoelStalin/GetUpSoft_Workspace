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
import React from 'react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'clients',
        element: <Clients />,
      },
      {
        path: 'billing',
        element: <Billing />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/mfa',
    element: <MFA />,
  },
]);
