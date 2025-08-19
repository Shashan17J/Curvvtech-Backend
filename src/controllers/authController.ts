import { Request, Response } from "express";
import User from "../models/user";
import config from "../configs/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  userSignUpSchema,
  userLoginSchema,
} from "../validationSchema/authSchema";

// signup
export const signUp = async (req: Request, res: Response) => {
  try {
    const parsed = userSignUpSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }

    const { name, email, password, role } = parsed.data;

    // check user already exist and not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Hash Password (10 is round)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, Please try again",
    });
  }
};

//  Login
export const login = async (req: Request, res: Response) => {
  try {
    const parsed = userLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }

    const { email, password } = parsed.data;

    // Find user with provided email (user exists or not)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first",
      });
    }

    // compare password
    if (await bcrypt.compare(password, user.password!)) {
      // Generate JWT token
      const token = jwt.sign(
        { email: user.email, id: user.userId, accountType: user.role },
        config.jwtSecret,
        {
          expiresIn: "24h",
        }
      );

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), //3days
        httpOnly: true,
      };

      res
        .cookie("token", token, options)
        .status(200)
        .json({
          success: true,
          token,
          user: {
            id: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again",
    });
  }
};
