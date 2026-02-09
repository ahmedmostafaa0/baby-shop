import Container from "@/components/common/Container";
import BabyTravelSection from "@/components/pages/home/BabyTravelSection";
import Banner from "@/components/pages/home/Banner";
import CategoriesSection from "@/components/pages/home/CategoriesSection";
import ComfyApparelSection from "@/components/pages/home/ComfyApparelSection";
import FeaturedServicesSection from "@/components/pages/home/FeaturedServicesSecion";
import HomeBrand from "@/components/pages/home/HomeBrand";
import ProductsList from "@/components/pages/home/ProductsList";
import api from "@/lib/config";
import { Brand } from "@/types/types";

const page = async () => {
  let brands: Brand[] = []
  try {
    const {data} = await api.get('/brands')
    brands = data.brands
  } catch (error) {
    console.log(error)
  }
  return (
    <Container className="min-h-screen flex py-7 gap-3">
      <CategoriesSection />
      <div className="flex-1">
        <Banner />
        <ProductsList />
        <HomeBrand brands={brands} />
        <BabyTravelSection />
        <ComfyApparelSection />
        <FeaturedServicesSection />
      </div>
    </Container>
  );
};

export default page;
