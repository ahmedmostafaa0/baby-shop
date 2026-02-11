"use client";

import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useCartStore } from "@/hooks/useCart";
import { useOrderStore } from "@/hooks/useOrder";

export default function AuthSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const loadCart = useCartStore((s) => s.loadCart);
  const clearCart = useCartStore((s) => s.clearCart);

  const loadOrder = useOrderStore((s) => s.loadOrders);
  const clearOrder = useOrderStore((s) => s.clearOrders);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
      loadOrder()
    } else {
      clearCart();
      clearOrder()
    }
  }, [isAuthenticated, loadCart, clearCart, loadOrder, clearOrder]);

  return <>{children}</>;
}
