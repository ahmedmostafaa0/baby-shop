import { Router } from "express";
import { protect } from "../middlewares/auth";
import upload from "../middlewares/upload";
import { uploadImage } from "../controllers/upload";


const router = Router();

router.post(
  "/image",
  protect,
  upload.single("file"),
  uploadImage
);

export default router;
