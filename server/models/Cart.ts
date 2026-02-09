import mongoose, { Model } from "mongoose";
import { ICart, ICartItem } from "../types/cart";

const cartItemSchema = new mongoose.Schema<ICartItem>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    // name: {
    //   type: String,
    //   required: true,
    // },
    // price: {
    //     type: Number,
    //     required: true,
    // },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    // image: {
    //     type: String
    // },
  },
  { timestamps: true},
);

const cartSchema = new mongoose.Schema<ICart>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {timestamps: true})

const Cart: Model<ICart> = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
