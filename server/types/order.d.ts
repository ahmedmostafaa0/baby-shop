import { Document, Types } from "mongoose";
import { IUser } from "./user";

interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface IOrderItem extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface IOrder extends Document {
  userId: Types.ObjectId | IUser;
  items: IOrderItem[];
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  total?: number;
  status?: "pending" | "paid" | "completed" | "cancelled";
  shippingAddress: ShippingAddress;
  paymentIntentId?: string
  stripeSessionId?: string
  paidAt?: Date
  reservationExpiresAt?: Date
  createdAt?: Date;
  updatedAt?: Date;
}
