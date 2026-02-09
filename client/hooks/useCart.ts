import { create } from "zustand";
import api from "@/lib/config";

type CartItem = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
  loading: boolean;

  loadCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  loading: false,

  loadCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/cart");
      set({ items: res.data.items || [], loading: false });
    } catch (error) {
      console.error("Failed to load cart:", error);
      set({ items: [], loading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ loading: true });
    try {
      const res = await api.post("/cart", { productId, quantity });
      set({ items: res.data.items || [], loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  updateQuantity: async (productId, quantity) => {
    set({ loading: true });
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      set({ items: res.data.items || [], loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  removeFromCart: async (productId) => {
    set({ loading: true });
    try {
      const res = await api.delete(`/cart/${productId}`);
      set({ items: res.data.items || [], loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  clearCart: async () => {
    const res = await api.delete("/cart");
    set({ items: res.data.items });
  },
}));
