import api from "@/lib/config";
import { create } from "zustand";

type WishlistState = {
  ids: string[];
  loading: boolean;

  loadWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearLocalWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  loading: false,

  loadWishlist: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/wishlist");
      set({ ids: res.data.ids, loading: false });
    } catch {
      set({ ids: [], loading: false });
    }
  },

  addToWishlist: async (productId) => {
    set({ loading: true });
    try {
      const res = await api.post("/wishlist", { productId });
      set({ ids: res.data.ids, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  removeFromWishlist: async (productId) => {
    set({ loading: true });
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      set({ ids: res.data.ids, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  clearLocalWishlist: () => {
    set({ ids: [] });
  },

  isInWishlist: (productId) => {
    return get().ids.includes(productId);
  },
}));
