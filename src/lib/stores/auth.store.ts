import { create } from "zustand";
import { persist } from "zustand/middleware";

// Minimal user interface matching backend response
interface AuthUser {
  id: number;
  email: string;
  role: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
}

interface AuthActions {
  login: (
    user: AuthUser,
    token: string,
    isSuperAdmin?: boolean,
    permissions?: string[]
  ) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: AuthUser) => void;
  updateAdminStatus: (isSuperAdmin: boolean, permissions: string[]) => void;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true
      isInitialized: false,
      isSuperAdmin: false,
      permissions: [],

      // Actions
      login: (
        user: AuthUser,
        token: string,
        isSuperAdmin = false,
        permissions = []
      ) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          isSuperAdmin,
          permissions,
        });
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          isSuperAdmin: false,
          permissions: [],
        }),

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),

      updateUser: (user: AuthUser) =>
        set({
          user,
        }),

      updateAdminStatus: (isSuperAdmin: boolean, permissions: string[]) =>
        set({
          isSuperAdmin,
          permissions,
        }),

      initialize: () => {
        const state = get();
        // If we have user and token, we're authenticated
        if (state.user && state.token) {
          set({
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } else {
          set({
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            isSuperAdmin: false,
            permissions: [],
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isSuperAdmin: state.isSuperAdmin,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        // When store is rehydrated from localStorage, initialize it
        if (state) {
          state.initialize();
        }
      },
    }
  )
);
