import { Document, Types } from "mongoose";
import { IProduct } from "./product";
import { ICartItem } from "./cart";

interface Address extends Document {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: "user" | "admin" | "deliveryman";
  refreshToken?: string | null;
  addresses: Types.DocumentArray<Address>;
  cart: ICartItem[];
  matchPassword(password: string): Promise<boolean>;
  createdAt?: Date;
  updatedAt?: Date;
}
