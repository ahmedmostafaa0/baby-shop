import express, { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  refreshAccessToken
} from "../controllers/auth";
import { protect } from "../middlewares/auth";

const router: Router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile);

router.post("/logout", logoutUser);

router.post("/refresh", refreshAccessToken);


export default router;
