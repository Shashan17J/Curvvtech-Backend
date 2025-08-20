import express from "express";
import { healthCheck } from "../controllers/healthCheckController";
import authMiddleware from "../middleware/authMiddleware";
import { healthCheckLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.post("/health-check", authMiddleware, healthCheckLimiter, healthCheck);

export default router;
