import { Request, Response } from "express";
import {
  getCsvJsonLogsQuerySchema,
  getLogsParamsSchema,
} from "../validationSchema/deviceLogsSchema";
import connectRedis from "../configs/redis";
import DeviceLog from "../models/deviceLogs";
import { Parser as Json2CsvParser } from "json2csv";
import { processExportJob } from "../jobs/processExportJob";
import Device from "../models/device";

export const handleLogsExport = async (
  req: Request,
  res: Response,
  format: "json" | "csv"
) => {
  try {
    const redis = await connectRedis();

    // Validate params
    const parsedParams = getLogsParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(403).json({
        success: false,
        message: parsedParams.error.issues.map((err) => err.message),
      });
    }

    // Validate query
    const parsedQuery = getCsvJsonLogsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(403).json({
        success: false,
        message: parsedQuery.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsedParams.data;
    const { limit = 100, startDate, endDate } = parsedQuery.data;

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    // For small requests returning immediately
    if (limit <= 500) {
      const query: any = { deviceId: id };
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setUTCHours(23, 59, 59, 999);
          query.timestamp.$lte = end;
        }
      }

      const logs = await DeviceLog.find(query).limit(limit);
      const formatted = logs.map((log) => ({
        id: log.logId,
        event: log.event,
        value: log.value,
        timestamp: log.timestamp,
      }));

      let output: string;
      if (format === "csv") {
        output = new Json2CsvParser().parse(formatted);
        res.header("Content-Type", "text/csv");
        res.attachment(`device_${id}_logs.csv`);
      } else {
        output = JSON.stringify(formatted, null, 2);
        res.header("Content-Type", "application/json");
        res.attachment(`device_${id}_logs.json`);
      }

      return res.send(output);
    }

    //For large exports → create async job
    const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await redis.hSet(`exportJob:${jobId}`, {
      status: "pending",
      format,
    });

    // Async processing (non-blocking)
    processExportJob(jobId, id, limit, startDate, endDate, format);

    return res.json({
      success: true,
      message: "Export job started",
      jobId,
    });
  } catch (error) {
    console.error("Error exporting logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
