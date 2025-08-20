import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../configs/config";
import User from "../models/user";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

// If access token valid → request succeeds.
// If refresh expired → 403 → must login again.
//Added blacklist check before using refresh token.
//On refresh, we blacklist old refresh token.
//Issued both new access + new refresh tokens.
//Stored the new refresh token in DB.
// both cookie have same alive but diff jwt expiration time.

export interface AuthRequest extends Request {
  user?: any;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res
        .status(401)
        .json({ success: false, message: "Access token missing" });
    }

    try {
      const decode = jwt.verify(accessToken, config.jwtSecret);
      req.user = decode;
      return next();
    } catch (error: any) {
      if (error.name !== "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Invalid access token" });
      }

      // If accessToken expired → check refreshToken
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res
          .status(401)
          .json({ success: false, message: "Refresh token missing" });
      }

      try {
        // Verifying refreshToken
        const decodedRefresh: any = jwt.verify(
          refreshToken,
          config.jwtRefreshSecret
        );

        const user = await User.findOne({ userId: decodedRefresh.id });
        if (!user) {
          return res
            .status(403)
            .json({ success: false, message: "User not found" });
        }

        // blacklist check
        if (user.blacklistedTokens?.includes(refreshToken)) {
          return res
            .status(403)
            .json({ success: false, message: "Refresh token blacklisted" });
        }

        if (user.refreshToken !== refreshToken) {
          return res
            .status(403)
            .json({ success: false, message: "Refresh token invalid" });
        }

        // Token Rotation:
        // 1. blacklisting old refresh tokens
        await User.updateOne(
          { userId: user.userId },
          { $push: { blacklistedTokens: refreshToken } }
        );

        // 2. Generate new tokens
        const newAccessToken = generateAccessToken({
          id: user.userId,
          email: user.email,
          accountType: user.role,
          orgId: user.orgId,
        });
        const newRefreshToken = generateRefreshToken({
          id: user.userId,
          email: user.email,
          accountType: user.role,
          orgId: user.orgId,
        });

        // 3. Save new refreshToken in user data
        user.refreshToken = newRefreshToken;
        await user.save();

        // 4. Seting cookies
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // 5. Attach user to req
        req.user = decodedRefresh;

        return next();
      } catch (refreshErr: any) {
        if (refreshErr.name === "TokenExpiredError") {
          return res.status(403).json({
            success: false,
            message: "Refresh token expired, please login again",
          });
        }
        return res
          .status(403)
          .json({ success: false, message: "Invalid refresh token" });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Auth check failed" });
  }
};

export default authMiddleware;
