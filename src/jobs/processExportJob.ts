import connectRedis from "../configs/redis";
import DeviceLog from "../models/deviceLogs";
import { mailSender } from "../services/mailService";
import { Parser as Json2CsvParser } from "json2csv";

export const processExportJob = async (
  jobId: string,
  id: string,
  limit: number,
  startDate?: string,
  endDate?: string,
  format: "json" | "csv" = "json"
) => {
  const redis = await connectRedis();
  try {
    await redis.hSet(`exportJob:${jobId}`, {
      status: "processing",
    });

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
    let fileName: string;

    if (format === "csv") {
      output = new Json2CsvParser().parse(formatted);
      fileName = `device_${id}_logs.csv`;
    } else {
      output = JSON.stringify(formatted, null, 2);
      fileName = `device_${id}_logs.json`;
    }

    // Save file contents to Redis
    await redis.hSet(`exportJob:${jobId}`, {
      status: "done",
      fileName,
      data: output,
    });

    await redis.expire(`exportJob:${jobId}`, 1200);

    // sending email (it will log the email but will not send it cause i am not using SMTP server, just using dummy server)
    const info = await mailSender(
      "shashank.jangid17@gmail.com",
      `Export job ${jobId} for device ${id} is ready`,
      "Hello, your log export is complete."
    );

    console.log(
      `Email sent successfully. MessageId: ${info ? info.messageId : ""} to:${info?.accepted[0]} `
    );

    // console.log(`Export job ${jobId} completed (${format})`);
  } catch (err: any) {
    console.error("Export job failed:", err);
    await redis.hSet(`exportJob:${jobId}`, {
      status: "error",
      error: err.message,
    });
  }
};
