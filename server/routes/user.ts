import express, { Router } from "express";
import {
  addAddress,
  createUser,
  deleteAddress,
  deleteUser,
  getUserById,
  getUsers,
  updateAddress,
  updateUser,
} from "../controllers/user";
import { admin, protect } from "../middlewares/auth";

const router: Router = express.Router();

router.get("/", protect, admin, getUsers);
router.post("/", protect, admin, createUser);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, admin, deleteUser);

router.post("/:id/addresses", protect, addAddress);

router
  .route("/:id/addresses/:addressId")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;
