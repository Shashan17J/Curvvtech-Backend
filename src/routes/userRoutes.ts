import express from "express";
import { signUp, login } from "../controllers/authController";
import { authLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.post("/signUp", authLimiter, signUp);
router.post("/login", authLimiter, login);

export default router;
