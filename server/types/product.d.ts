import { Document, Types } from "mongoose";
import { ICategory } from "./category";
import { IUser } from "./user";
import { IBrand } from "./brand";

interface IProductRating {
  _id?: Types.ObjectId;

  userId: Types.ObjectId | IUser;
  rating: number;
  createdAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPercentage?: number;
  stock?: number;

  ratings: IProductRating[];
  averageRating?: number;

  image: string;
  category: Types.ObjectId | ICategory;
  brand: Types.ObjectId | IBrand;


  createdAt?: Date;
  updatedAt?: Date;
}
