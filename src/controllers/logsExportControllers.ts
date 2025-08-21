import { Request, Response } from "express";
import { handleLogsExport } from "../services/csv&jsonLogsExportService";
import connectRedis from "../configs/redis";
import { getExportQuerySchema } from "../validationSchema/deviceLogsSchema";

export const getLogsJsonExport = (req: Request, res: Response) =>
  handleLogsExport(req, res, "json");

export const getLogsCsvExport = (req: Request, res: Response) =>
  handleLogsExport(req, res, "csv");

export const getExportStatus = async (req: Request, res: Response) => {
  try {
    const redis = await connectRedis();

    const parsed = getExportQuerySchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(403).json({
        success: false,
        message: parsed.error.issues.map((err) => err.message),
      });
    }

    const { jobId } = parsed.data;

    const job = await redis.hGetAll(`exportJob:${jobId}`);

    if (!job || !job.status) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status === "done" && job.data) {
      // default type to json if not set
      const fileType = job.format || "json";

      if (fileType === "csv") {
        res.header("Content-Type", "text/csv");
      } else {
        res.header("Content-Type", "application/json");
      }

      res.attachment(job.fileName || `logs_${jobId}.${job.format}`);

      // if job status is ready then send the data
      return res.send(job.data);
    }

    // if job status is pending
    return res.json({
      success: true,
      job: {
        fileName: job.fileName,
        format: job.format,
        status: job.status,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching job status",
      error: error.message,
    });
  }
};
