import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import config from "./configs/config";
import connect from "./configs/database";
import "./jobs/statusUpdateJob";
import connectRedis from "./configs/redis";
import { responseTimeLogger } from "./middleware/responseTimeLogger";
import { ipLogger } from "./middleware/ipLogMiddleware";

import userRoute from "./routes/userRoutes";
import deviceRoute from "./routes/deviceRoutes";
import deviceLogsRoute from "./routes/deviceLogsRoutes";
import eventsRoute from "./routes/eventRoutes";
import healthCheckRoute from "./routes/healthCheckRoute";
import logsExportRoute from "./routes/logsExportsRoutes";
import usageReportRoute from "./routes/usageReportsRoute";

import { enableQueryLogging } from "./middleware/monitorQueryMiddleware";

const app = express();
const PORT = config.port;

// database connect
connect();

// redis connect
connectRedis();

enableQueryLogging();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Ip Logging
app.use(ipLogger);

app.use(responseTimeLogger);

app.use("/api/v1/auth", userRoute);
app.use("/api/v1", deviceRoute);
app.use("/api/v1", deviceLogsRoute);
app.use("/api/v1", eventsRoute);
app.use("/api/v1", healthCheckRoute);
app.use("/api/v1", logsExportRoute);
app.use("/api/v1", usageReportRoute);

// def route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running..",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
