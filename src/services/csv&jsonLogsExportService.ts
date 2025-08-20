import { Request, Response } from "express";
import {
  getCsvJsonLogsQuerySchema,
  getLogsParamsSchema,
} from "../validationSchema/deviceLogsSchema";
import connectRedis from "../configs/redis";
import Device from "../models/device";
import DeviceLog from "../models/deviceLogs";
import { Parser as Json2CsvParser } from "json2csv";

// GET /logs/:id/export/json
export const getLogsJsonExport = async (req: Request, res: Response) => {
  try {
    const redis = await connectRedis();

    // Validating params
    const parsedParams = getLogsParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(403).json({
        success: false,
        message: parsedParams.error.issues.map((err) => err.message),
      });
    }

    // Validating query
    const parsedQuery = getCsvJsonLogsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(403).json({
        success: false,
        message: parsedQuery.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsedParams.data;
    const { limit = 100, startDate, endDate } = parsedQuery.data;

    // return cache data if found
    const cacheKey = `logs:${id}:json&limit:${limit}&start:${startDate}&end${endDate}`;
    const cachedJson = await redis.get(cacheKey);
    if (cachedJson) {
      res.header("Content-Type", "application/json");
      res.attachment(`device_${id}_logs.json`);
      return res.send(cachedJson);
    }

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    // date filtering
    const query: any = { deviceId: id };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999); //full day
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

    // Converting JSON string for caching and file export
    const jsonString = JSON.stringify(formatted, null, 2);

    // Cache JSON in Redis for 5 minutes
    await redis.set(cacheKey, jsonString, { EX: 300 });

    // Sending as downloadable JSON file
    res.header("Content-Type", "application/json");
    res.attachment(`device_${id}_logs.json`);
    res.send(jsonString);
  } catch (error) {
    console.error("Error exporting logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLogsCsvExport = async (req: Request, res: Response) => {
  try {
    const redis = await connectRedis();

    const parsedParams = getLogsParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(403).json({
        success: false,
        message: parsedParams.error.issues.map((err) => err.message),
      });
    }

    const parsedQuery = getCsvJsonLogsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(403).json({
        success: false,
        message: parsedQuery.error.issues.map((err) => err.message),
      });
    }

    const { id } = parsedParams.data;
    const { limit = 100, startDate, endDate } = parsedQuery.data;

    // retun cache data if found
    const cacheKey = `logs:${id}:csv&limit:${limit}&start${startDate}&end:${endDate}`;
    const cachedCsv = await redis.get(cacheKey);
    if (cachedCsv) {
      res.header("Content-Type", "text/csv");
      res.attachment(`device_${id}_logs.csv`);
      return res.send(cachedCsv);
    }

    const device = await Device.findOne({ deviceId: id });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    const query: any = { deviceId: id };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999); //full day
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

    // Converting to CSV
    const csv = new Json2CsvParser().parse(formatted);

    // Caching CSV in Redis for 5 minutes
    await redis.set(cacheKey, csv, { EX: 300 });

    res.header("Content-Type", "text/csv");
    res.attachment(`device_${id}_logs.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
