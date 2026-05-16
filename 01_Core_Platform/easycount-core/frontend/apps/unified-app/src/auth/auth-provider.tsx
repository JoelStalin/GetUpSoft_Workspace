import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore, AuthUser } from '../store/auth-store';

interface AuthContextType {
  user: AuthUser | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, hydrate, hydrated, clearSession } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const logout = () => {
    clearSession();
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-cyan-400 font-mono">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-pink-500 animate-spin-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] tracking-[0.5em] animate-pulse uppercase">Initializing_Secure_Node</p>
          <div className="w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-cyan-500 animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout, isLoading: !hydrated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
