import { Document, Types } from "mongoose";
import { IUser } from './user';
import { IProduct } from "./product";

export interface ICartItem {
  productId: Types.ObjectId | IProduct;
  name?: string;
  price?: number;
  quantity: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface ICart extends Document {
  userId: Types.ObjectId | IUser;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
