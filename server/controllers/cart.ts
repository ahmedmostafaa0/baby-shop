import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product";
import Cart from "../models/Cart";

const getCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const userId = req.user._id;

  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart) {
    res.json({
      success: true,
      items: [],
    });
    return
  }

  res.json({
    success: true,
    items: cart.items,
  });
});

const addItemToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!req.user?._id) {
    res.status(401);
    throw new Error("Unauthorized");
  }
  const userId = req.user._id;

  if (!productId) throw new Error("Product ID required");

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (index !== -1) {
    cart.items[index]!.quantity += Number(quantity);
  } else {
    cart.items.push({
      productId,
      quantity: Number(quantity),
    });
  }

  await cart.save();
  await cart.populate("items.productId");

  res.json({
    success: true,
    items: cart.items,
  });
});

const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const userId = req.user._id;
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Cart not found");

  const index = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (index === -1) throw new Error("Item not found");

  if (Number(quantity) < 1) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index]!.quantity = Number(quantity);
  }

  await cart.save();
  await cart.populate("items.productId");

  res.json({
    success: true,
    items: cart.items,
  });
});

const removeItemFromCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const userId = req.user._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();
  await cart.populate("items.productId");

  res.json({
    success: true,
    items: cart.items,
  });
});

const clearCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const userId = req.user._id;

  await Cart.findOneAndUpdate(
    { userId },
    { items: [] }
  );

  res.json({
    success: true,
    items: [],
  });
});

export {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
};
