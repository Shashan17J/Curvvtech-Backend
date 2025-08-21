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
import connectRedis from "../configs/redis";

export const createLog = async (req: Request, res: Response) => {
  try {
    // const redis = await connectRedis();
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

    // await redis.lPush(
    //   `logs:${device.deviceId}`,
    //   JSON.stringify({
    //     id: newLog.logId,
    //     event: newLog.event,
    //     value: newLog.value,
    //     timestamp: newLog.timestamp,
    //   })
    // );

    // await redis.lTrim(`logs:${device.deviceId}`, 0, 99);

    // await redis.expire(`logs:${device.deviceId}`, 300); //5 min

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
    const redis = await connectRedis();
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

    const cachedLogs = await redis.lRange(`logs:${id}`, 0, limit - 1);
    if (cachedLogs.length > 0) {
      return res.status(200).json({
        success: true,
        logs: cachedLogs.map((log) => JSON.parse(log)),
        fromCache: true,
      });
    }

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    const logs = await DeviceLog.find({ deviceId: id }).limit(limit);

    const formatted = logs.map((log) => ({
      id: log.logId,
      event: log.event,
      value: log.value,
      timestamp: log.timestamp,
    }));

    if (formatted.length > 0) {
      await redis.del(`logs:${id}`);
      await redis.rPush(
        `logs:${id}`,
        formatted.map((log) => JSON.stringify(log))
      );
      await redis.expire(`logs:${id}`, 300); //5 min
    }

    res.status(200).json({ success: true, logs: formatted, fromCache: false });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const redis = await connectRedis();
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

    // const cachedLogs = await redis.lRange(`logs:${id} range:${range}`, 0, -1);
    const cached = await redis.get(`usage:${id}:range:${range}`);
    if (cached) {
      return res.status(200).json({
        success: true,
        ...JSON.parse(cached),
        fromCache: true,
      });
    }

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    // Calculating time range
    const hours = parseInt(range.replace("h", ""), 10);
    const fromTime = new Date();
    fromTime.setHours(fromTime.getHours() - hours);

    const logs = await DeviceLog.aggregate([
      {
        $match: {
          deviceId: id,
          event: "units_consumed",
          timestamp: { $gte: fromTime },
        },
      },
      { $group: { _id: null, totalUnits: { $sum: "$value" } } },
    ]);

    // if (logs) {
    //   await redis.del(`logs:${id} range:${range}`);
    //   await redis.rPush(
    //     `logs:${id} range:${range}`,
    //     JSON.stringify({
    //       device_id: id,
    //       total_units_last_24h: logs.length > 0 ? logs[0].totalUnits : 0,
    //     })
    //   );
    //   await redis.expire(`logs:${id} range:${range}`, 300); //5 min
    // }

    if (logs) {
      const result = {
        device_id: id,
        total_units_last_24h: logs.length > 0 ? logs[0].totalUnits : 0,
      };

      await redis.set(`usage:${id}:range:${range}`, JSON.stringify(result), {
        EX: 300,
      });
    }

    res.status(200).json({
      success: true,
      device_id: id,
      total_units_last_24h: logs.length > 0 ? logs[0].totalUnits : 0,
      fromCache: false,
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
