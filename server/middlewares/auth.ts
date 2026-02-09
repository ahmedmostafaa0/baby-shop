import jwt, { type JwtPayload } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import generateTokens from "../utils/generateToken";
import type { NextFunction, Request, Response } from "express";
import User from "../models/User";

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let accessToken = req.headers.authorization?.split(" ")[1];

    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          process.env.JWT_ACCESS_SECRET as string,
        ) as JwtPayload;

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          res.status(401);
          throw new Error("Authentication failed. User not found.");
        }

        req.user = user;
        return next();
      } catch (err) {
        // accessToken = undefined
      }
    }

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
          sameSite: "lax",
        });
        res.status(401);
        throw new Error("Invalid session. Please login again.");
      }

      const { accessToken: newAccess } =
        generateTokens(user.id);

      res.setHeader("x-access-token", newAccess);

      req.user = user;
      next();
    } catch (error) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(401);
      throw new Error("Session expired. Please login again.");
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
