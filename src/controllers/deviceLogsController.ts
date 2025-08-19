import { Request, Response } from "express";
import Device from "../models/device";
import DeviceLog from "../models/deviceLogs";
import {
  createLogsBodySchema,
  createLogsParamsSchema,
  getLogsParamsSchema,
  getLogsQuerySchema,
  getUsageParamsSchema,
  getUsageQuerySchema,
} from "../validationSchema/deviceLogsSchema";

export const createLog = async (req: Request, res: Response) => {
  try {
    const parsedParams = createLogsParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(403).json({
        success: false,
        message: parsedParams.error.issues.map((err) => err.message),
      });
    }

    const parsedBody = createLogsBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(403).json({
        success: false,
        message: parsedBody.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsedParams.data;
    const { event, value } = parsedBody.data;

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    const newLog = await DeviceLog.create({
      deviceId: device.deviceId,
      event,
      value,
    });

    await newLog.save();

    res.status(201).json({
      success: true,
      message: "Log Created Successfully",
      logs: {
        id: newLog.logId,
        event: newLog.event,
        value: newLog.value,
        timestamp: newLog.timestamp,
      },
    });
  } catch (error) {
    console.error("Error creating log:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const parsedParams = getLogsParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(403).json({
        success: false,
        message: parsedParams.error.issues.map((err) => err.message),
      });
    }

    const parsedQuery = getLogsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(403).json({
        success: false,
        message: parsedQuery.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsedParams.data;
    const { limit } = parsedQuery.data;

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    const logs = await DeviceLog.find({ deviceId: device.deviceId }).limit(
      limit
    );

    res.status(200).json({
      success: true,
      logs: logs.map((log) => ({
        id: log.logId,
        event: log.event,
        value: log.value,
        timestamp: log.timestamp,
      })),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const parsedParams = getUsageParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(403).json({
        success: false,
        message: parsedParams.error.issues.map((err) => err.message),
      });
    }

    const parsedQuery = getUsageQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(403).json({
        success: false,
        message: parsedQuery.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsedParams.data;
    const { range } = parsedQuery.data;

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    // Calculating time range
    let fromTime = new Date();
    if (range === "24h") {
      fromTime.setHours(fromTime.getHours() - 24);
    }

    const logs = await DeviceLog.aggregate([
      {
        $match: {
          device_id: device._id,
          event: "units_consumed",
          timestamp: { $gte: fromTime },
        },
      },
      { $group: { _id: null, totalUnits: { $sum: "$value" } } },
    ]);

    res.status(200).json({
      success: true,
      device_id: id,
      total_units_last_24h: logs.length > 0 ? logs[0].totalUnits : 0,
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
