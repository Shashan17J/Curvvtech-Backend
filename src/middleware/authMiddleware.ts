import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../configs/config";

export interface AuthRequest extends Request {
  user?: any;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.token ||
      req.body?.token ||
      (req.header("Authorization")
        ? req.header("Authorization")!.replace("Bearer ", "")
        : "");

    if (!token) {
      return res.status(401).json({ success: false, message: `Token Missing` });
    }

    try {
      const decode = jwt.verify(token, config.jwtSecret);
      req.user = decode;

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "token is invalid" });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `Something Went Wrong While Validating the Token`,
    });
  }
};

export default authMiddleware;
