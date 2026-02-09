import ShopPageClient from "@/components/common/ShopPageClient";
import api from "@/lib/config";
import { Category } from "@/types/types";

interface CategoriesResponse {
  categories: Category[];
}

const ShopPageServer = async () => {
  const {data} = await api.get("/brands");
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const {data} = await api.get("/categories");
    categories = data.categories;
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred";
    console.log("error", error);
  }
  return (
    <div>
      <ShopPageClient  categories={categories} brands={data.brands} />
    </div>
  );
};

export default ShopPageServer;