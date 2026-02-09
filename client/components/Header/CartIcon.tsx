'use client'
import { useCartStore } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const CartIcon = () => {
  const {items} = useCartStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted){
      return (
    <Link
      href="/user/cart"
      className="relative hover:text-babyshopSky hoverEffect"
      title="My Orders"
    >
      <ShoppingBag size={24} />
      <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
        0
      </span>
    </Link>
  );
  }
  const totalItems = items.length
  return (
    <Link
      href="/user/cart"
      className="relative hover:text-babyshopSky hoverEffect"
      title="My Orders"
    >
      <ShoppingBag size={24} />
      <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
        {totalItems > 99 ? '99+' : totalItems}
      </span>
    </Link>
  );
};

export default CartIcon;
