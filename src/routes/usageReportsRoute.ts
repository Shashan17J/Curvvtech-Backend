import express from "express";
import { getUsageReport } from "../services/usageReportsService";
import authMiddleware from "../middleware/authMiddleware";
import { usageReportLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.get(
  "/devices/:id/usage/report",
  authMiddleware,
  usageReportLimiter,
  getUsageReport
);

export default router;
