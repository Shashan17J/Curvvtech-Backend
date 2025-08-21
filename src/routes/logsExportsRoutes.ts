import express from "express";
import {
  getLogsJsonExport,
  getLogsCsvExport,
  getExportStatus,
} from "../controllers/logsExportControllers";
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

router.get(
  "/logs/:id/export/status/:jobId",
  authMiddleware,
  logsExportLimiter,
  getExportStatus
);

export default router;
