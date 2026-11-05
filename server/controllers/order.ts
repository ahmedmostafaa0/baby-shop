import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/Order";
import Product from "../models/Product";
import { IUser } from "../types/user";

interface Update {
  status: "pending" | "paid" | "completed" | "cancelled";
  updatedAt: Date;
  paymentIntentId?: string;
  stripeSessionId?: string;
  paidAt?: Date;
}

const getAllOrdersAdmin = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 10;
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * perPage;
  const total = await Order.countDocuments({});
  const totalPages = Math.ceil(total / perPage);

  const orders = await Order.find({})
    .populate("userId", "name email")
    .populate("items.productId", "name price image")
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(perPage);

const transformedOrders = orders.map((order) => {
  const user = order.userId as IUser | null;

  return {
    _id: order._id,
    orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
    user: user
      ? {
          _id: user._id,
          name: user.name,
          email: user.email,
        }
      : {
          _id: "deleted",
          name: "Deleted User",
          email: "N/A",
        },

    items: order.items.map((item) => {
      const product = item.productId as any;

      return {
        product: product
          ? {
              _id: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
            }
          : {
              _id: "deleted",
              name: "Deleted Product",
              price: 0,
              image: "",
            },
        quantity: item.quantity,
        price: item.price,
      };
    }),

    totalAmount: order.total,
    status: order.status,
    paymentStatus:
      order.status === "paid" || order.status === "completed"
        ? "paid"
        : order.status === "cancelled"
        ? "failed"
        : "pending",

    shippingAddress: order.shippingAddress || {
      street: "N/A",
      city: "N/A",
      state: "N/A",
      zipCode: "N/A",
      country: "N/A",
    },

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
});


  res.json({
    orders: transformedOrders,
    total,
    totalPages,
    page,
    perPage,
  });
});

const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.user?._id }).populate(
    "items.productId",
  );
  res.json(orders);
});

const createOrderFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { items, shippingAddress } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Cart items are required");
    }
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country ||
      !shippingAddress.postalCode
    ) {
      res.status(400);
      throw new Error(
        "Shipping address is required with all fields (street, city, country, postalCode)",
      );
    }

    const validateItems = await Promise.all(
      items.map(async (item: { _id?: string; quantity?: number }) => {
        const quantity = Number(item.quantity);
        if (
          !item._id ||
          !Number.isSafeInteger(quantity) ||
          quantity < 1
        ) {
          res.status(400);
          throw new Error("Each order item requires a valid product ID and positive integer quantity");
        }

        const product = await Product.findById(item._id);
        if (!product) {
          res.status(404);
          throw new Error("One or more products could not be found");
        }
        if (quantity > product.stock) {
          res.status(400);
          throw new Error(`Requested quantity for ${product.name} exceeds available stock`);
        }

        const discountedPrice = Number(
          (product.price * (1 - (product.discountPercentage || 0) / 100)).toFixed(2),
        );

        return {
          productId: product._id,
          name: product.name,
          price: discountedPrice,
          quantity,
          image: product.image[0] || "",
        };
      }),
    );

    const total = validateItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    if (!req.user) throw new Error("Not authenticated");
    const order = await Order.create({
      userId: req.user._id,
      items: validateItems,
      total,
      status: "pending",
      shippingAddress,
    });
    res.status(201).json({
      success: true,
      order,
      message: "Order created successfully",
    });
  },
);

const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const isAdmin = req.user?.role === "admin";
  if (!req.user || (!isAdmin && req.user._id.toString() !== order.userId.toString())) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json(order);
});

const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found!");
  }
  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});

const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, paymentIntentId, stripeSessionId } = req.body || {};
  if (!req.body) {
    res.status(400).json({
      success: false,
      message: "Request body is missing",
    });
  }
  const validStatues = ["pending", "paid", "completed", "cancelled"];
  if (!validStatues.includes(status)) {
    res.status(400);
    throw new Error(
      "Invalid status. Must be one of: pending, paid, completed, cancelled",
    );
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found!");
  }

  if (req.user && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only administrators can update order status");
  }

  if (!req.user && status !== "paid") {
    res.status(400);
    throw new Error("Webhook updates may only mark an order as paid");
  }

  if (status === "paid" && !stripeSessionId) {
    res.status(400);
    throw new Error("Stripe session ID is required for paid orders");
  }

  if (status === "paid" && order.status !== "pending" && order.status !== "paid") {
    res.status(409);
    throw new Error("Only pending orders can be marked as paid");
  }

  const updateData: Update = {
    status,
    updatedAt: new Date(),
  };

  if (status === "paid") {
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
    if (stripeSessionId) {
      updateData.stripeSessionId = stripeSessionId;
    }
    updateData.paidAt = new Date();
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true },
  );

  res.json({
    success: true,
    order: updatedOrder,
    message: `Order updated to ${status}`,
  });
});

export {
  getAllOrdersAdmin,
  getOrders,
  createOrderFromCart,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
};
