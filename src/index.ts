import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import config from "./configs/config";
import connect from "./configs/database";

import userRoute from "./routes/userRoutes";
import deviceRoute from "./routes/deviceRoutes";
import deviceLogsRoute from "./routes/deviceLogsRoutes";

const app = express();
const PORT = config.port;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 6000,
  max: 100,
  message: "Too many request from this IP, please try again after minute",
  headers: true,
  validate: true,
});

// database connect
connect();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(limiter);

app.use("/api/v1/auth", userRoute);
app.use("/api/v1", deviceRoute);
app.use("/api/v1", deviceLogsRoute);

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
