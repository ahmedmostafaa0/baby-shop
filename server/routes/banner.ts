import express from "express";
import { admin, protect } from "../middlewares/auth";
import { createBanner, deleteBanner, getBannerById, getBanners, updateBanner } from "../controllers/banner";


const router = express.Router();


router.route("/").get(getBanners).post(protect, admin, createBanner);


router
  .route("/:id")
  .get(protect, getBannerById)
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;