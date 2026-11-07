import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export const webhookAuth = (req: Request, res: Response, next: NextFunction) => {
  const configuredSecret = process.env.STRIPE_WEBHOOK_SYNC_SECRET;
  const suppliedSecret = req.header("x-webhook-secret");

  if (!configuredSecret) {
    res.status(500);
    throw new Error("Webhook sync secret is not configured");
  }

  if (!suppliedSecret) {
    res.status(401);
    throw new Error("Unauthorized webhook request");
  }

  const expected = Buffer.from(configuredSecret);
  const actual = Buffer.from(suppliedSecret);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    res.status(401);
    throw new Error("Unauthorized webhook request");
  }

  next();
};
