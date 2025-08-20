import express from "express";
import { deviceEvents } from "../services/sseService";
import authMiddleware from "../middleware/authMiddleware";
import { sseLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.get("/events", authMiddleware, sseLimiter, deviceEvents);

export default router;
