import rateLimit from "express-rate-limit";

//for auth routes
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later.",
});

// for device routes (100req/min)
export const deviceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests for device operations.",
});

//for device log routes (50req/min)
export const deviceLogLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: "Too many requests for device operations.",
});

//for sse event route (10req/min)
export const sseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many requests for device operations.",
});

//for health check route(5req/min)
export const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "Too many requests for device operations.",
});

//for logs export route(5req/min)
export const logsExportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "Too many requests for device operations.",
});

//for usage Reports (3req/min)
export const usageReportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: "Too many requests for device operations.",
});
