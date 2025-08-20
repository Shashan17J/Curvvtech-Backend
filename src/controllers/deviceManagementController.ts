import { Request, Response } from "express";
import Device from "../models/device";
import User from "../models/user";
import { broadcastToOrg } from "../services/sseService";
import {
  registerDeviceSchema,
  listDeviceSchema,
  updateDeviceSchema,
  deleteDeviceSchema,
  heartbeatDeviceSchema,
  heartbeatDeviceBodySchema,
} from "../validationSchema/deviceSchema";
import connectRedis from "../configs/redis";

interface AuthRequest extends Request {
  user?: any;
}

export const registerDevice = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = registerDeviceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }

    const { name, type, status } = parsed.data;

    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newDevice = await Device.create({
      name,
      type,
      status,
      last_active_at: null,
      owner_id: user.userId,
    });

    await newDevice.save();

    res.status(200).json({
      status: true,
      device: {
        id: newDevice.deviceId,
        name: newDevice.name,
        type: newDevice.type,
        status: newDevice.status || "active",
        last_active_at: newDevice.last_active_at,
        owner_id: user.userId,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const listDevices = async (req: Request, res: Response) => {
  try {
    const redis = await connectRedis();
    const parsed = listDeviceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }
    const { type, status } = parsed.data;

    const redisKey = `devices:${type || "all"}:${status || "all"}`;

    const cachedDevices = await redis.lRange(redisKey, 0, -1);
    if (cachedDevices.length > 0) {
      return res.status(200).json({
        success: true,
        devices: cachedDevices.map((d) => JSON.parse(d)),
        fromCache: true,
      });
    }

    const filters: any = {};
    if (type) filters.type = type;
    if (status) filters.status = status;

    const devices = await Device.find(filters).populate(
      "owner_id",
      "name email userId"
    );

    const formatted = devices.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      status: d.status,
      last_active_at: d.last_active_at,
      owner_id: d.owner_id,
    }));

    if (formatted.length > 0) {
      await redis.del(redisKey); // clear old cached device
      await redis.rPush(
        redisKey,
        formatted.map((d) => JSON.stringify(d))
      );
      await redis.expire(redisKey, 1200); // 20 min exp
    }

    res.status(200).json({
      success: true,
      // count: devices.length,
      devices: formatted,
      fromCache: false,
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDevice = async (req: AuthRequest, res: Response) => {
  try {
    const redis = await connectRedis();
    const parsed = updateDeviceSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsed.data;
    const updates = req.body;

    if (updates.status) {
      updates.last_active_at = new Date();
    }

    const updatedDevice = await Device.findOneAndUpdate(
      { deviceId: id },
      updates,
      { new: true }
    );

    if (!updatedDevice) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    const keys = await redis.keys("devices:*");
    if (keys.length > 0) {
      await redis.del(keys);
    }

    // Broadcasting to org
    if (req.user?.orgId) {
      broadcastToOrg(req.user.orgId, {
        message: "Device Updated",
        id: updatedDevice.id,
        name: updatedDevice.name,
        type: updatedDevice.type,
        status: updatedDevice.status,
        last_active_at: updatedDevice.last_active_at,
        owner_id: updatedDevice.owner_id,
      });
    }

    res.status(200).json({
      success: true,
      device: {
        id: updatedDevice.id,
        name: updatedDevice.name,
        type: updatedDevice.type,
        status: updatedDevice.status,
        last_active_at: updatedDevice.last_active_at,
        owner_id: updatedDevice.owner_id,
      },
    });
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const parsed = deleteDeviceSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsed.data;

    const deletedDevice = await Device.findOneAndDelete({ deviceId: id });

    if (!deletedDevice) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    res.status(200).json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const heartbeatDevice = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = heartbeatDeviceSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }

    const parsedBody = heartbeatDeviceBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(403).json({
        success: false,
        message: parsedBody.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsed.data;
    const { status } = parsedBody.data;

    const updatedDevice = await Device.findOneAndUpdate(
      { deviceId: id },
      { last_active_at: new Date(), status: status },
      { new: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Broadcasting to org
    if (req.user?.orgId) {
      broadcastToOrg(req.user.orgId, {
        deviceId: updatedDevice.deviceId,
        status: updatedDevice.status,
        last_active_at: updatedDevice.last_active_at,
      });
    }

    res.status(200).json({
      success: true,
      message: "Device heartbeat recorded",
      last_active_at: updatedDevice.last_active_at,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
