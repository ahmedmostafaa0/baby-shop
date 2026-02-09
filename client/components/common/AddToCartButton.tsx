"use client";

import React, { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/types";
import { useCartStore } from "@/hooks/useCart";
import useAuth from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {toast} from 'sonner'
interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async(e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      router.push("/auth/signin");
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product._id, 1);
      toast.success("Added to cart successfully!", {
        description: `Name: ${product?.name}`,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant="outline"
      disabled={localLoading}
      className={cn("rounded-full px-6 mt-1", className)}
    >
      {localLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to cart
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;