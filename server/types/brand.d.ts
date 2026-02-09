import { Document, Types } from "mongoose";

export interface IBrand extends Document {
  name: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
