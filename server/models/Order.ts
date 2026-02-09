import mongoose, { Model } from "mongoose";
import { IOrderItem, IOrder } from "../types/order";
import { IUser } from '../types/user';

const orderItemSchema = new mongoose.Schema<IOrderItem>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema<IOrder>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "completed", "cancelled"],
    default: "pending",
  },
  shippingAddress: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
  },
  paymentIntentId: {
    type: String
  },
  stripeSessionId: {
    type: String
  },
  paidAt: {
    type: Date
  }
}, {timestamps: true});

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
