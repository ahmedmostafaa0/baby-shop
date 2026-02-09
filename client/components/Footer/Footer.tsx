import TopFooter from "./TopFooter";
import Image from "next/image";
import Container from "../common/Container";
import { payment } from "@/assets/image";
import HrLine from "../common/HrLine";

const Footer = () => {
  return (
    <footer className="w-full bg-babyshopWhite">
      <TopFooter />
      <HrLine />
      {/* FooterMiddle */}

      <HrLine />
      {/* FooterBottom */}
      <Container className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-5">
        <p>© 2024 Babyshop Theme. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <p>We using safe payment for</p>
          <Image src={payment} alt="paymentImage" />
        </div>
      </Container>
    </footer>
  );
};

export default Footer;