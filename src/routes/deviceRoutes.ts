import express from "express";
import {
  registerDevice,
  listDevices,
  updateDevice,
  deleteDevice,
  heartbeatDevice,
} from "../controllers/deviceManagementController";

import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/devices", authMiddleware, registerDevice);
router.get("/devices", authMiddleware, listDevices);
router.patch("/devices/:id", authMiddleware, updateDevice);
router.delete("/devices/:id", authMiddleware, deleteDevice);
router.post("/devices/:id/heartbeat", authMiddleware, heartbeatDevice);

export default router;
