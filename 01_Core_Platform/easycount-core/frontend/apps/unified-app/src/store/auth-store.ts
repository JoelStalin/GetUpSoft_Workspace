import { create } from "zustand";

export type UserRole = "ADMIN" | "SOCIO" | "PARTNER" | "USER";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const STORAGE_KEY = "easycount-unified-auth";

function readSession(): AuthSession | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch (error) {
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (session) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,
  hydrate: () => {
    const session = readSession();
    if (!session) {
      set({ hydrated: true });
      return;
    }
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      hydrated: true,
    });
  },
  setSession: (session) => {
    persistSession(session);
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      hydrated: true,
    });
  },
  clearSession: () => {
    persistSession(null);
    set({ accessToken: null, refreshToken: null, user: null, hydrated: true });
  },
}));
