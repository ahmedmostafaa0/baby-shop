import { Document, Types } from "mongoose";

export interface IBanner extends Document {
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
  createdAt?: Date;
  updatedAt?: Date;
}
