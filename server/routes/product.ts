import express from "express";

import { admin, protect } from "../middlewares/auth";
import { createProduct, deleteProduct, getProductById, getProducts, rateProduct, updateProduct } from "../controllers/products";


const router = express.Router();

router.route("/").get(getProducts).post(protect, admin, createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route("/:id/rate").post(protect, rateProduct);

export default router;