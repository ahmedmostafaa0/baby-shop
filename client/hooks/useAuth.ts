import api from "@/lib/config";
import { Address } from "@/types/types";
import { create } from "zustand";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin" | "deliveryman";
  addresses: Address[]
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  setToken: (token: string) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    role: string;
    name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkIsAdmin: () => boolean;
  clearAuth: () => void;
  restoreAuth: () => Promise<void>;
};

const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isRestoring: true,
  setToken: (token) => set({ token }),
  clearAuth: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isRestoring: false,
    }),
  restoreAuth: async () => {
    try {
      const response = await api.get("/auth/profile");
      if (response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Auth restoration failed:", error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isRestoring: false });
    }
  },
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        set({
          user: response.data,
          token: response.data.token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.log("Login Error: ", error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      if (res.data.token) {
        set({
          user: res.data,
          token: res.data.token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Registration error: ", error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout Error: ", error);
      throw error;
    }
  },
  checkIsAdmin: () => {
    const { user } = get();
    return user?.role === "admin";
  },
}));

export default useAuth;