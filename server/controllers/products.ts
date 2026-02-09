import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product";

const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 10;
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const skip = (page - 1) * perPage;
  const total = await Product.countDocuments({});
  const totalPages = Math.ceil(total / perPage);

  const products = await Product.find({})
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: sortOrder })
    .populate("category", "name")
    .populate("brand", "name");

  res.json({ page, perPage, total, totalPages, products });
});

const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    category,
    brand,
    image,
    discountPercentage,
    stock,
  } = req.body;
  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product with this name already exists");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    image,
    discountPercentage: discountPercentage || 0,
    stock: stock || 0,
  });
  res.status(201).json({ product });
});

const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await Product.findById(id)
    .populate("category", "name")
    .populate("brand", "name");
  if (!product) {
    res.status(404);
    throw new Error("Product not found!");
  }
  res.json(product);
});

const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    category,
    brand,
    image,
    discountPercentage,
    stock,
  } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.discountPercentage = discountPercentage || product.discountPercentage;
  product.stock = stock || product.stock;

  if (image) {
    product.image = image || product.image;
  }
  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ message: "Product deleted successfully" });
});

const rateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { rating } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found!");
  }
  const alreadyRated = product.ratings.find(
    (r) => r.userId.toString() === req.user?._id.toString(),
  );
  if (alreadyRated) {
    alreadyRated.rating = rating;
  } else {
    product.ratings.push({
      userId: req.user?._id,
      rating,
    });
  }
  await product.save();
  res.json(product);
});

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  rateProduct,
};
