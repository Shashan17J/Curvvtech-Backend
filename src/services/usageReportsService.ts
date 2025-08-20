import { Request, Response } from "express";
import connectRedis from "../configs/redis";
import {
  getUsageParamsSchema,
  getUsageQuerySchema,
} from "../validationSchema/deviceLogsSchema";
import Device from "../models/device";
import DeviceLog from "../models/deviceLogs";

export const getUsageReport = async (req: Request, res: Response) => {
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

    const cacheKey = `usage:${id}:range:${range}`;
    const cached = await redis.get(cacheKey);
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

    // ✅ Time range
    const hours = parseInt(range.replace("h", ""), 10);
    const fromTime = new Date();
    fromTime.setHours(fromTime.getHours() - hours);

    // ✅ Choose grouping interval
    let groupFormat = "%Y-%m-%dT%H:00:00Z"; // hourly default
    if (hours > 24 && hours <= 48) {
      groupFormat = "%Y-%m-%dT%H:00:00Z"; // still hourly
    }
    if (hours > 48) {
      groupFormat = "%Y-%m-%d"; // daily
    }

    // ✅ Aggregate usage per interval
    const logs = await DeviceLog.aggregate([
      {
        $match: {
          deviceId: id,
          event: "units_consumed",
          timestamp: { $gte: fromTime },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$timestamp" },
          },
          totalUnits: { $sum: "$value" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ✅ Convert aggregation to chart format
    const labels = logs.map((l) => l._id);
    const data = logs.map((l) => l.totalUnits);
    const total = data.reduce((a, b) => a + b, 0);

    const result = {
      device_id: id,
      range,
      chart: { labels, data },
      total,
    };

    // ✅ Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(result), { EX: 300 });

    res.status(200).json({
      success: true,
      ...result,
      fromCache: false,
    });
  } catch (error) {
    console.error("Error fetching usage report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
