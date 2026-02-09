"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/types";

interface ProductDescriptionProps {
  product?: Product;
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="w-full">
      <Tabs
        defaultValue="description"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        {/* Tabs header */}
        <TabsList className="flex w-full gap-2 bg-transparent border-b border-babyshopTextLight/30 rounded-none p-0 ">
          {[
            { value: "description", label: "Description" },
            { value: "brand", label: "Brand" },
            { value: "reviews", label: "Reviews (0)" },
            { value: "questions", label: "Questions" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='py-2 text-babyshopBlack hover:text-babyshopSky rounded-lg transition-all'
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content */}
        <div className="mt-6 rounded-xl bg-babyshopWhite p-6 shadow-sm border border-babyshopTextLight/20">
          <TabsContent value="description">
            <h3 className="text-base font-semibold text-babyshopBlack mb-2">
              Product Description
            </h3>
            <p className="text-sm leading-relaxed text-babyshopBlack/70">
              {product?.description ||
                "No description available for this product."}
            </p>
          </TabsContent>

          <TabsContent value="brand">
            <h3 className="text-base font-semibold text-babyshopBlack mb-2">
              About the Brand
            </h3>
            <p className="text-sm leading-relaxed text-babyshopBlack/70">
              {product?.brand
                ? `Learn more about ${product.brand.name}, a trusted name in quality products.`
                : "No brand information available."}
            </p>
          </TabsContent>

          <TabsContent value="reviews">
            <h3 className="text-base font-semibold text-babyshopBlack mb-2">
              Customer Reviews
            </h3>
            <p className="text-sm text-babyshopBlack/70">
              No reviews yet. Be the first to share your experience!
            </p>
          </TabsContent>

          <TabsContent value="questions">
            <h3 className="text-base font-semibold text-babyshopBlack mb-2">
              Questions
            </h3>
            <p className="text-sm text-babyshopBlack/70">
              Have questions about this product? Ask away and we’ll get back to
              you.
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProductDescription;
