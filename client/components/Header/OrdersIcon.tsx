"use client";
import useAuth from "@/hooks/useAuth";
import { useOrderStore } from "@/hooks/useOrder";
import { Package } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";


const OrdersIcon = () => {
  const { isAuthenticated, user } = useAuth();
  const { orders, loading } = useOrderStore();


  // Only show for authenticated users and after hydration
  if (!isAuthenticated || !user ) {
    return null;
  }


  const ordersCount = orders.length;

  return (
    <Link
      href="/user/orders"
      className="relative hover:text-babyshopSky hoverEffect"
      title="My Orders"
    >
      <Package size={24} />
      {!loading && ordersCount > 0 && (
        <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          {ordersCount > 99 ? "99+" : ordersCount}
        </span>
      )}
    </Link>
  );
};

export default OrdersIcon;