import mongoose, { Model } from "mongoose";
import { ICategory } from "../types/category";

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: false
    },
    categoryType: {
        type: String,
        required: true,
        enum: ['Featured', 'Hot Categories', 'Top Categories']
    }
  },
  { timestamps: true },
);

const Category: Model<ICategory> = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
