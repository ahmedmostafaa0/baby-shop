import type { Response, Request } from "express";
import asyncHandler from "express-async-handler";
import Category from "../models/Category";

const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const perPage = Number(req.query.perPage);
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  if (page < 1 || perPage < 1) {
    res.status(400);
    throw new Error("Page and perPage must be positive integers");
  }

  const skip = (page - 1) * perPage;
  const total = await Category.countDocuments({});
  const totalPages = Math.ceil(total / perPage);

  const categories = await Category.find({})
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: sortOrder });

  res.json({ categories, total, page, perPage, totalPages });
});

const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, image, categoryType } = req.body;
  if (!name || typeof name !== "string") {
    res.status(400);
    throw new Error("Category name is required and must be a string");
  }
  const validateCategoryTypes = [
    "Featured",
    "Hot Categories",
    "Top Categories",
  ];
  if (!validateCategoryTypes.includes(categoryType)) {
    res.status(400);
    throw new Error("Invalid category type");
  }
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }
  const category = await Category.create({
    name,
    image: image || "",
    categoryType,
  });
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const {name, image, categoryType} = req.body
  const validateCategoryTypes = [
    "Featured",
    "Hot Categories",
    "Top Categories",
  ];
  if (!validateCategoryTypes.includes(categoryType)) {
    res.status(400);
    throw new Error("Invalid category type");
  }
  const category = await Category.findById(req.params.id)
  if(!category){
    res.status(404)
    throw new Error('Category not found!')
  }
  category.name = name || category.name
  category.categoryType = categoryType || category.categoryType
  if(image) {
    category.image = image || category.image
  }
  const updatedCategory = await category.save()
  res.json(updatedCategory)
});

const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if(!category){
    res.status(404)
    throw new Error('Category not found!')
  }
  res.json({message: 'Category deleted'})
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
