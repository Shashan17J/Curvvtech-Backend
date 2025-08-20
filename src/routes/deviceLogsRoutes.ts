import express from "express";
import {
  createLog,
  getLogs,
  getUsage,
} from "../controllers/deviceLogsController";
import authMiddleware from "../middleware/authMiddleware";
import { deviceLogLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.post("/devices/:id/logs", authMiddleware, deviceLogLimiter, createLog);
router.get("/devices/:id/logs", authMiddleware, deviceLogLimiter, getLogs);
router.get("/devices/:id/usage", authMiddleware, deviceLogLimiter, getUsage);

export default router;
