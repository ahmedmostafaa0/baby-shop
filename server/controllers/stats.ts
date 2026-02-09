import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import Product from "../models/Product";
import Category from "../models/Category";
import Brand from "../models/Brand";
import Order from "../models/Order";

const getStats = asyncHandler(async (req: Request, res: Response) => {
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();
  const categoriesCount = await Category.countDocuments();
  const brandsCount = await Brand.countDocuments();
  const ordersCount = await Order.countDocuments();

  const revenueData = await Order.aggregate([
    { $match: { status: { $in: ["paid", "completed", "delivered"] } } },
    { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
  ]);
  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  const roles = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const categoryData = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    { $group: { _id: "$categoryInfo.name", count: { $sum: 1 } } },
  ]);

  const brandData = await Product.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brandInfo",
      },
    },
    { $unwind: "$brandInfo" },
    { $group: { _id: "$brandInfo.name", count: { $sum: 1 } } },
  ]);

  res.json({
    counts: {
      users: usersCount,
      products: productsCount,
      categories: categoriesCount,
      brands: brandsCount,
      orders: ordersCount,
      totalRevenue: totalRevenue,
    },
    roles: roles.map((role) => ({
      name: role._id,
      value: role.count,
    })),
    categories: categoryData.map((category) => ({
      name: category._id,
      value: category.count,
    })),
    brands: brandData.map((brand) => ({
      name: brand._id,
      value: brand.count,
    })),
  });
});

export { getStats };
