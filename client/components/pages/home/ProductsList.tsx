import ProductCard from "@/components/common/ProductCard";
import api from "@/lib/config";
import { Product } from "@/types/types";

const ProductsList = async () => {
  let products: Product[] = [];

  try {
    const { data } = await api.get("/products", {
      params: { perPage: 10 },
    });
    products = data.products;
  } catch (error) {
    console.log("Product fetching Error:", error);
  }

  if (products?.length === 0) {
    return (
      <div className="bg-babyshopWhite p-5 rounded-md border">
        <p className="text-xl font-semibold">No Products Available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-babyshopWhite border mt-3 rounded-md">
      <div className="w-full p-5 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
