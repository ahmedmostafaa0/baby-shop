import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/Order";
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
    const user = order.userId as IUser;
    return {
      _id: order._id,
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      items: order.items.map((item) => {
        return {
          product: {
            _id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
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

    const validateItems = items.map((item) => {
      if (!item._id || !item.name || !item.price || !item.quantity) {
        res.status(400);
        throw new Error("Invalid item structure");
      }
      return {
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      };
    });

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
  const { status, paymentIntentId, stripeSessionId } = req.body;
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

  if (req.user) {
    const isAdmin = req.user?.role === "admin";
    const isPending = order.status === "pending";
    const isOwner = req.user._id.toString() !== order.userId.toString();
    if ((!isAdmin && !isPending) || !isOwner) {
      res.status(403);
      throw new Error(
        isPending
          ? "Not authorized to update this order"
          : "Order status can be updated by admin after payment",
      );
    }
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
    { new: true, runValidators: false },
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
