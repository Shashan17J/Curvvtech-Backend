import { Request, Response } from "express";
import Device from "../models/device";
import User from "../models/user";
import {
  registerDeviceSchema,
  listDeviceSchema,
  updateDeviceSchema,
  deleteDeviceSchema,
  heartbeatDeviceSchema,
} from "../validationSchema/deviceSchema";

interface AuthRequest extends Request {
  user?: any;
}

export const registerDevice = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, status } = registerDeviceSchema.parse(req.body);

    // await Device.collection.dropIndexes();
    if (!name || !type) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

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
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const listDevices = async (req: Request, res: Response) => {
  try {
    const { type, status } = listDeviceSchema.parse(req.body);

    const filters: any = {};
    if (type) filters.type = type;
    if (status) filters.status = status;

    const devices = await Device.find(filters).populate(
      "owner_id",
      "name email userId"
    );

    res.status(200).json({
      success: true,
      count: devices.length,
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        last_active_at: d.last_active_at,
        owner_id: d.owner_id,
      })),
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const { id } = updateDeviceSchema.parse(req.params);
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
    const { id } = deleteDeviceSchema.parse(req.params);

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

export const heartbeatDevice = async (req: Request, res: Response) => {
  try {
    const { id } = heartbeatDeviceSchema.parse(req.params);

    const updatedDevice = await Device.findOneAndUpdate(
      { deviceId: id },
      { last_active_at: new Date() },
      { new: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
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
