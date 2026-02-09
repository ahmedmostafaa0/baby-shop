"use client";

import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";
import { useOrderStore } from "@/hooks/useOrder";

export default function AuthSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const loadCart = useCartStore((s) => s.loadCart);
  const clearCart = useCartStore((s) => s.clearLocalCart);
  const loadWishlist = useWishlistStore((s) => s.loadWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearLocalWishlist);
  const loadOrder = useOrderStore((s) => s.loadOrders);
  const clearOrder = useOrderStore((s) => s.clearOrders);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
      loadWishlist();
      loadOrder()
    } else {
      clearCart();
      clearWishlist();
      clearOrder()
    }
  }, [isAuthenticated, loadCart, loadWishlist, clearCart, clearWishlist, loadOrder, clearOrder]);

  return <>{children}</>;
}
