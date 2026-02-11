"use client";
import React, { useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import { Product } from "@/types/types";
import { Button } from "../ui/button";

interface ProductActionsProps {
  product: Product;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if(type === 'increase'){
        setQuantity(prev => prev + 1)
    }else{
        setQuantity(prev => prev > 1 ? prev - 1 : 1)
    }
  }

  return (
    <>
      {/* Product name */}
      <div className="flex items-center justify-between gap-5">
        <h1 className="text-2xl font-bold line-clamp-1">{product?.name}</h1>
        <div className="flex items-center gap-2">
        </div>
      </div>

      {/* Quantity and Add to Cart */}
      <div>
        <p className="mb-2">Quantity</p>
        <div className="flex items-center gap-5">
          <div className="border flex items-center gap-6 px-5 py-2 rounded-full">
            <button
              onClick={() => handleQuantityChange('decrease')}
              className="border-0 bg-transparent text-babyshopBlack hover:text-babyshopSky hoverEffect"
            >
              <Minus size={18} />
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => handleQuantityChange('increase')}
              className="border-0 bg-transparent text-babyshopBlack hover:text-babyshopSky hoverEffect"
            >
              <Plus size={18} />
            </button>
          </div>
          <Button  variant={'outline'} className="flex-1 py-5 border-babyshopTextLight hover:border-babyshopSky hover:bg-babyshopSky hover:text-babyshopWhite text-base font-medium">
            Add To Cart
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductActions;
