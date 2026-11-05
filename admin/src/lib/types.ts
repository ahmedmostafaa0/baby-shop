export interface User{
    _id: string
    name: string
    email: string
    avatar: string
    role: 'admin' | 'user' | 'deliveryman'
    createdAt: Date
}

export interface Brand{
    _id: string
    name: string
    image?: string 
    createdAt: Date
}

export interface Category{
    _id: string
    name: string
    image?: string 
    categoryType: 'Featured' | 'Hot Categories' | 'Top Categories'
    createdAt: Date
}

interface Rating{
    userId: User
    rating: number
    createdAt: Date
}

export interface Product{
    _id: string
    name: string
    description: string
    price: number
    discountPercentage: number
    stock: number
    averageRating: number
    image: string[]
    ratings: Rating[]
    category: Category
    brand: Brand
    createdAt: Date
}

export type Banner = {
  _id: string;
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
  createdAt: Date;
};

export interface StatsData {
  counts: {
    users: number;
    products: number;
    categories: number;
    brands: number;
    orders: number;
    totalRevenue: number;
  };
  roles: { name: string; value: number }[];
  categories: { name: string; value: number }[];
  brands: { name: string; value: number }[];
}

export interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: "pending" | "paid" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyRevenueItem {
  _id: { month: number; year: number };
  revenue: number;
  orders: number;
}

export interface OrderStatusBreakdownItem {
  _id: string;
  count: number;
  totalValue: number;
}

export interface BestSellingProductItem {
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface RecentOrderItem {
  _id: string;
  userId?: { name?: string } | null;
  createdAt: string | Date;
  total: number;
  status: string;
}

export interface InventoryProductItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
  };
  inventory: {
    lowStockProducts: InventoryProductItem[];
    outOfStockProducts: InventoryProductItem[];
    lowStockCount: number;
    outOfStockCount: number;
  };
  sales: {
    bestSellingProducts: BestSellingProductItem[];
    recentOrders: RecentOrderItem[];
    monthlyRevenue: MonthlyRevenueItem[];
    orderStatusBreakdown: OrderStatusBreakdownItem[];
  };
}