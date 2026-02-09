import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import generateTokens from "../utils/generateToken";

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // #swagger.security = []
  // #swagger.tags = ["Auth"]
  const { name, email, password, role } = req.body;
  const existUser = await User.findOne({ email });
  if (existUser) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    role,
    addresses: [],
  });
  const { accessToken, refreshToken } = generateTokens(user.id);
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: accessToken,
    role: user.role
  });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // #swagger.security = []
  // #swagger.tags = ["Auth"]
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(400);
    throw new Error("Invalid email or password");
  }
  const { accessToken, refreshToken } = generateTokens(user.id);
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: accessToken,
    role: user.role
  });
});

const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // #swagger.tags = ["Auth"]

  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }

  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    addresses: user.addresses,
  });
});


const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // #swagger.tags = ['Auth']

  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) {
    res.clearCookie('refreshToken')
    res.status(204).json({ message: "Already logged out" });
  }

  const user = await User.findOne({ refreshToken: refreshToken as string });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    message: "Logged out successfully",
  });
});

export { registerUser, loginUser, getUserProfile, logoutUser };
