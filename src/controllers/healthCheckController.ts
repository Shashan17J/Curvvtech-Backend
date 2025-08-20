import { Request, Response } from "express";
import connect from "../configs/database";
import connectRedis from "../configs/redis";

interface HealthStatus {
  status: "ok" | "not ok need paracetamol";
  dependencies: {
    database: string | null;
    redis: string | null;
  };
}

export const healthCheck = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const dbStatus = await connect();
    const redisClient = await connectRedis();
    const redisStatus = redisClient.isOpen
      ? "Redis Connected Successfully"
      : "Redis Connection Failed";

    const status: HealthStatus = {
      status:
        dbStatus === "DB Connected Successfully" &&
        redisStatus === "Redis Connected Successfully"
          ? "ok"
          : "not ok need paracetamol",
      dependencies: {
        database: dbStatus,
        redis: redisStatus,
      },
    };

    res.status(status.status === "ok" ? 200 : 500).json(status);
  } catch (error: unknown) {
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
