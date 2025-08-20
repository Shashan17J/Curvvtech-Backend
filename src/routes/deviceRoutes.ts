import express from "express";
import {
  registerDevice,
  listDevices,
  updateDevice,
  deleteDevice,
  heartbeatDevice,
} from "../controllers/deviceManagementController";
import authMiddleware from "../middleware/authMiddleware";
import { deviceLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.post("/devices", authMiddleware, deviceLimiter, registerDevice);
router.get("/devices", authMiddleware, deviceLimiter, listDevices);
router.patch("/devices/:id", authMiddleware, deviceLimiter, updateDevice);
router.delete("/devices/:id", authMiddleware, deviceLimiter, deleteDevice);
router.post(
  "/devices/:id/heartbeat",
  authMiddleware,
  deviceLimiter,
  heartbeatDevice
);

export default router;
