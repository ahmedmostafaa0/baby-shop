// src/stores/useOrderStore.ts
import { create } from "zustand";
import api from "@/lib/config";

// src/types/order.ts
export type OrderStatus = "pending" | "paid" | "completed" | "cancelled";

export type OrderItem = {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
};

export type Order = {
  _id: string;
  orderId?: string; // admin view
  items: OrderItem[];
  totalAmount?: number;
  total?: number;
  status: OrderStatus;
  paymentStatus?: "paid" | "pending" | "failed";
  shippingAddress?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
};


type OrderState = {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;

  loadOrders: () => Promise<void>;
  getOrderById: (orderId: string) => Promise<void>;
  createOrder: (data: {
    items: any[];
    shippingAddress: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  }) => Promise<Order>;
  clearOrders: () => void;
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  loading: false,

  loadOrders: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/orders");
      set({ orders: res.data });
    } finally {
      set({ loading: false });
    }
  },

  getOrderById: async (orderId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/orders/${orderId}`);
      set({ selectedOrder: res.data });
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post("/orders", data);
      const order = res.data.order;
      set((state) => ({
        orders: [order, ...state.orders],
      }));
      return order;
    } finally {
      set({ loading: false });
    }
  },

  clearOrders: () => {
    set({ orders: [], selectedOrder: null });
  },
}));
