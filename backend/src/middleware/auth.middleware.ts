import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/api.types";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = (req.headers as any)["authorization"]?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access Denied. No token provided.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token.",
      timestamp: new Date().toISOString(),
    });
  }
};

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Access denied. Admin access required.",
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
};
