import { footerFour, footerOne, footerThree, footerTwo } from "@/assets/image";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import {
  Shield,
  DollarSign,
  Truck,
  HeartHandshake,
  Award,
  Users,
  Clock,
  Star,
} from "lucide-react";

const topHelpCenter = [
  { title: "Order Tracking", href: "/user/orders" },
  { title: "Shop Now", href: "/shop" },
];

const socialLinks = [
  { title: "Facebook", icon: <Facebook size={16} />, href: "/" },
  { title: "Instagram", icon: <Instagram size={16} />, href: "/" },
  { title: "Linkedin", icon: <Linkedin size={16} />, href: "/" },
  { title: "Twitter", icon: <Twitter size={16} />, href: "/" },
];

const footerTopData = [
  {
    title: "High Quality Selection",
    subTitle: "Total product quality control for peace of mind",
    image: footerOne,
  },
  {
    title: "Affordable Prices",
    subTitle: "Factory direct prices for maximum savings",
    image: footerTwo,
  },
  {
    title: "Express Shipping",
    subTitle: "Fast, reliable delivery from global warehouse",
    image: footerThree,
  },
  {
    title: "Worry free",
    subTitle: "Instant access to professional support",
    image: footerFour,
  },
];

const services = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "High Quality Selection",
    description: "Total product quality control for peace of mind",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Affordable Prices",
    description: "Factory direct prices for maximum savings",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: "Express Shipping",
    description: "Fast, reliable delivery from global warehouse",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: <HeartHandshake className="w-8 h-8" />,
    title: "Worry Free",
    description: "Instant access to professional support",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
];

const stats = [
  {
    icon: <Users className="w-6 h-6" />,
    number: "50K+",
    label: "Happy Customers",
  },
  {
    icon: <Award className="w-6 h-6" />,
    number: "99.9%",
    label: "Satisfaction Rate",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    number: "24/7",
    label: "Customer Support",
  },
  {
    icon: <Star className="w-6 h-6" />,
    number: "4.9",
    label: "Average Rating",
  },
];


export { topHelpCenter, footerTopData, socialLinks, services, stats};
