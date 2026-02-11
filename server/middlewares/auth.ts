import jwt, { type JwtPayload } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import type { NextFunction, Request, Response } from "express";
import User from "../models/User";

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      res.status(401);
      throw new Error("No access token provided");
    }

    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET as string,
      ) as JwtPayload;

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }

      req.user = user;
      next();
    } catch {
    }
  },
);


const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("Not authorized as an admin");
};

export { protect, admin };
