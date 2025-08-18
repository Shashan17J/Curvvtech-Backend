import express from "express";
import {
  createLog,
  getLogs,
  getUsage,
} from "../controllers/deviceLogsController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/devices/:id/logs", authMiddleware, createLog);
router.get("/devices/:id/logs", authMiddleware, getLogs);
router.get("/devices/:id/usage", authMiddleware, getUsage);

export default router;
