import { create } from "zustand";
const STORAGE_KEY = "easycount-unified-auth";
function readSession() {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch (error) {
        return null;
    }
}
function persistSession(session) {
    if (session) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    else {
        window.sessionStorage.removeItem(STORAGE_KEY);
    }
}
export const useAuthStore = create((set) => ({
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
