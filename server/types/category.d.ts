import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  image?: string;
  categoryType?: 'Featured' | 'Hot Categories' | 'Top Categories'
  createdAt?: Date;
  updatedAt?: Date;
}
