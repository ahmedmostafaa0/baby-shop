"use client";
import useAuth from "@/hooks/useAuth";
import { useWishlistStore } from "@/hooks/useWishlist";
import { Heart } from "lucide-react";
import Link from "next/link";


const WishlistIcon = () => {
  const { isAuthenticated, user } = useAuth();
  const { ids } = useWishlistStore();

  // Only show for authenticated users and after hydration
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Link
      href="/user/wishlist"
      className="relative hover:text-babyshopSky hoverEffect"
      title="My Wishlist"
    >
      <Heart size={24} />
      {ids?.length > 0 && (
        <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          {ids.length > 99 ? "99+" : ids.length}
        </span>
      )}
    </Link>
  );
};

export default WishlistIcon;