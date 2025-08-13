import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const webhookVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const signature = req.headers["x-webhook-signature"];
  const secret = req.headers["x-webhook-secret"];

  if (!signature || !secret) {
    res.status(401).json({
      success: false,
      error: "Unauthorized. Webhook verification failed.",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret as string)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    res.status(401).json({
      success: false,
      error: "Invalid webhook signature.",
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
};
