import type { Request, Response } from "express";
import mongoose from "mongoose";
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
      throw new Error("Shipping address is required with all fields (street, city, country, postalCode)");
    }
    if (!req.user) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    const requestedQuantities = new Map<string, number>();
    for (const item of items as { _id?: string; quantity?: number }[]) {
      const productId = item._id;
      const quantity = Number(item.quantity);
      if (
        typeof productId !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(productId) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        res.status(400);
        throw new Error("Each order item requires a valid product ID and positive integer quantity");
      }
      const combinedQuantity = (requestedQuantities.get(productId) ?? 0) + quantity;
      if (!Number.isSafeInteger(combinedQuantity)) {
        res.status(400);
        throw new Error("Combined product quantity is too large");
      }
      requestedQuantities.set(productId, combinedQuantity);
    }

    const session = await mongoose.startSession();
    let createdOrder: InstanceType<typeof Order> | null = null;
    try {
      await session.withTransaction(async () => {
        const products = await Product.find({
          _id: { $in: [...requestedQuantities.keys()] },
        }).session(session);
        const productsById = new Map(products.map((product) => [product._id.toString(), product]));

        if (productsById.size !== requestedQuantities.size) {
          res.status(404);
          throw new Error("One or more products could not be found");
        }

        const orderItems = [...requestedQuantities.entries()].map(([productId, quantity]) => {
          const product = productsById.get(productId)!;
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
        });

        // Conditional decrements make stock reservation safe under concurrent orders.
        for (const [productId, quantity] of requestedQuantities.entries()) {
          const reservation = await Product.updateOne(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { session },
          );
          if (reservation.modifiedCount !== 1) {
            res.status(409);
            throw new Error("Insufficient stock for one or more products");
          }
        }

        const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        createdOrder = new Order({
          userId: req.user!._id,
          items: orderItems,
          total,
          status: "pending",
          reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
          shippingAddress,
        });
        await createdOrder.save({ session });
      });
    } finally {
      await session.endSession();
    }

    if (!createdOrder) {
      res.status(500);
      throw new Error("Order could not be created");
    }
    res.status(201).json({
      success: true,
      order: createdOrder,
      message: "Order created and inventory reserved successfully",
    });
  },
);

const getCheckoutSummary = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate("userId", "email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.status !== "pending") {
    res.status(409);
    throw new Error("Only pending orders can be checked out");
  }
  if (!order.reservationExpiresAt || order.reservationExpiresAt.getTime() <= Date.now()) {
    res.status(409);
    throw new Error("This order has no active inventory reservation; create a new order");
  }

  const user = order.userId as IUser | null;
  const isAdmin = req.user?.role === "admin";
  if (!req.user || (!isAdmin && (!user || req.user._id.toString() !== user._id.toString()))) {
    res.status(403);
    throw new Error("Not authorized to check out this order");
  }
  res.json({
    orderId: order._id,
    status: order.status,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    customerEmail: user?.email,
  });
});

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
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found!");
  }
  if (order.status !== "cancelled") {
    res.status(409);
    throw new Error("Only cancelled orders can be deleted; paid and completed orders are retained for audit history");
  }
  await Order.deleteOne({ _id: order._id });
  res.json({ success: true, message: "Order deleted successfully" });
});

const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, paymentIntentId, stripeSessionId } = req.body || {};
  const validStatuses = ["pending", "paid", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be one of: pending, paid, completed, cancelled");
  }

  const isWebhook = !req.user;
  if (isWebhook && (!stripeSessionId || typeof stripeSessionId !== "string")) {
    res.status(400);
    throw new Error("A valid Stripe session ID is required for webhook updates");
  }
  if (!isWebhook && req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Only administrators can update order status");
  }

  if (isWebhook && status === "pending") {
    const attached = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "pending",
        $or: [{ stripeSessionId: { $exists: false } }, { stripeSessionId: null }, { stripeSessionId }],
      },
      { $set: { stripeSessionId, updatedAt: new Date() } },
      { returnDocument: "after", runValidators: true },
    );
    if (!attached) {
      res.status(409);
      throw new Error("Order is not pending or already has a different checkout session");
    }
    res.json({ success: true, order: attached, message: "Stripe checkout session attached" });
    return;
  }

  if (isWebhook && status === "paid") {
    const paidOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, status: "pending", stripeSessionId },
      {
        $set: {
          status: "paid",
          paymentIntentId: typeof paymentIntentId === "string" ? paymentIntentId : undefined,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", runValidators: true },
    );
    if (paidOrder) {
      res.json({ success: true, order: paidOrder, message: "Order marked as paid" });
      return;
    }
    const existing = await Order.findById(req.params.id);
    if (
      (existing?.status === "paid" || existing?.status === "completed") &&
      existing.stripeSessionId === stripeSessionId
    ) {
      res.json({ success: true, order: existing, message: "Payment event already processed" });
      return;
    }
    res.status(409);
    throw new Error("Order is not pending for this Stripe session");
  }

  if (isWebhook && status === "cancelled") {
    const session = await mongoose.startSession();
    let cancelledOrder: InstanceType<typeof Order> | null = null;
    try {
      await session.withTransaction(async () => {
        cancelledOrder = await Order.findOneAndUpdate(
          { _id: req.params.id, status: "pending", stripeSessionId },
          { $set: { status: "cancelled", updatedAt: new Date() } },
          { returnDocument: "after", session },
        );
        if (!cancelledOrder) return;

        for (const item of cancelledOrder.items) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }

    if (cancelledOrder) {
      res.json({ success: true, order: cancelledOrder, message: "Expired checkout cancelled and inventory restored" });
      return;
    }
    const existing = await Order.findById(req.params.id);
    if (
      existing &&
      existing.stripeSessionId === stripeSessionId &&
      (existing.status === "cancelled" || existing.status === "paid" || existing.status === "completed")
    ) {
      res.json({
        success: true,
        order: existing,
        message: existing.status === "cancelled"
          ? "Expiration event already processed"
          : "Checkout was already paid; stale expiration event ignored",
      });
      return;
    }
    res.status(409);
    throw new Error("Order is not pending for this Stripe session");
  }

  if (isWebhook) {
    res.status(400);
    throw new Error("Unsupported webhook status transition");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found!");
  }

  if (status === "cancelled") {
    if (order.status !== "pending" || order.stripeSessionId) {
      res.status(409);
      throw new Error("Orders with an active Stripe checkout must expire through Stripe before inventory can be released");
    }

    // Orders created before transactional reservations have no expiry marker and
    // therefore never had stock deducted. Cancel them without incrementing stock.
    if (!order.reservationExpiresAt) {
      const legacyCancellation = await Order.findOneAndUpdate(
        {
          _id: order._id,
          status: "pending",
          $or: [
            { stripeSessionId: { $exists: false } },
            { stripeSessionId: null },
          ],
          $and: [
            {
              $or: [
                { reservationExpiresAt: { $exists: false } },
                { reservationExpiresAt: null },
              ],
            },
          ],
        },
        { $set: { status: "cancelled", updatedAt: new Date() } },
        { returnDocument: "after" },
      );
      if (!legacyCancellation) {
        res.status(409);
        throw new Error("Order was already changed");
      }
      res.json({
        success: true,
        order: legacyCancellation,
        message: "Legacy order cancelled; no inventory reservation existed",
      });
      return;
    }

    const session = await mongoose.startSession();
    let cancelledOrder: InstanceType<typeof Order> | null = null;
    try {
      await session.withTransaction(async () => {
        cancelledOrder = await Order.findOneAndUpdate(
          {
            _id: order._id,
            status: "pending",
            $or: [
              { stripeSessionId: { $exists: false } },
              { stripeSessionId: null },
            ],
          },
          { $set: { status: "cancelled", updatedAt: new Date() } },
          { returnDocument: "after", session },
        );
        if (!cancelledOrder) {
          res.status(409);
          throw new Error("Order was already changed");
        }
        for (const item of cancelledOrder.items) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }
    res.json({ success: true, order: cancelledOrder, message: "Order cancelled and inventory restored" });
    return;
  }

  if (status === "completed" && order.status === "paid") {
    const completed = await Order.findOneAndUpdate(
      { _id: order._id, status: "paid" },
      { $set: { status: "completed", updatedAt: new Date() } },
      { returnDocument: "after", runValidators: true },
    );
    res.json({ success: true, order: completed, message: "Order marked as completed" });
    return;
  }

  res.status(409);
  throw new Error("Unsupported order status transition");
});

export {
  getAllOrdersAdmin,
  getOrders,
  createOrderFromCart,
  getOrderById,
  getCheckoutSummary,
  deleteOrder,
  updateOrderStatus,
};
