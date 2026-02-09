export interface Category {
  _id: string;
  name: string;
  image: string;
  categoryType: string;
}

export interface Brand {
  _id: string;
  name: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  averageRating: number;
  image: string[];
  category: Category;
  brand: Brand;
  ratings: [];
  quantity?: number;
}

export interface Address {
  _id: string
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Banner {
  _id: string;
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "completed" | "cancelled";
  shippingAddress: ShippingAddress;
  paymentIntentId?: string;
  stripeSessionId?: string;
  
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface StripeCheckoutItem {
  name: string;
  description?: string;
  amount: number; // in cents
  currency: string;
  quantity: number;
  images?: string[];
}

export interface CheckoutSessionRequest {
  items: StripeCheckoutItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}
