import express from "express";
import {
  getLogsJsonExport,
  getLogsCsvExport,
} from "../services/csv&jsonLogsExportService";
import authMiddleware from "../middleware/authMiddleware";
import { logsExportLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.get(
  "/logs/:id/export/json",
  authMiddleware,
  logsExportLimiter,
  getLogsJsonExport
);

router.get(
  "/logs/:id/export/csv",
  authMiddleware,
  logsExportLimiter,
  getLogsCsvExport
);

export default router;
