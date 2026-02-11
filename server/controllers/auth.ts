import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import generateTokens from "../utils/generateToken";
import  jwt, { JwtPayload } from 'jsonwebtoken';

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
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
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
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
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
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    message: "Logged out successfully",
  });
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  // #swagger.tags = ["Auth"]
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(401);
    throw new Error("No session. Please login again.");
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.refreshToken !== refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.status(401);
      throw new Error("Invalid session. Please login again.");
    }

    const { accessToken: newAccess } = generateTokens(user.id);


    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccess,
    });
  } catch (error) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(401);
    throw new Error("Session expired. Please login again.");
  }
});

export { registerUser, loginUser, getUserProfile, logoutUser, refreshAccessToken };
