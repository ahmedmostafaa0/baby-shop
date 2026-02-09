import { topHelpCenter } from "@/constants/data";
import Container from "../common/Container";
import Link from "next/link";
import TopSocialLinks from "./TopSocialLinks";

const TopHeader = () => {
  return (
    <div className="w-full bg-babyshopPurple text-babyShopLightWhite py-1 text-sm font-medium">
      <Container className="grid grid-cols-1 md:grid-cols-3">
        <div className="flex items-center gap-5">
          {topHelpCenter?.map((item) => (
            <Link
              key={item?.title}
              href={item?.href}
              className="hover:text-babyshopWhite hoverEffect"
            >
              {item?.title}
            </Link>
          ))}
        </div>
        <p className="text-center hidden md:inline-flex">
          100% Secure delivery without contracting the courier
        </p>
        <div className="hidden md:inline-flex justify-end items-center">
          <TopSocialLinks />
        </div>
      </Container>
    </div>
  );
};

export default TopHeader;
