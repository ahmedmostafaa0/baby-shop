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
  items: ICartItem[];
  total?: Number;
  status?: "pending" | "paid" | "completed" | "cancelled";
  shippingAddress: ShippingAddress;
  paymentIntentId?: string
  stripeSessionId?: string
  paidAt?: Date
  createdAt?: Date;
  updatedAt?: Date;
}
