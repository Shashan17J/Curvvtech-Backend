import { Request, Response, NextFunction } from "express";

export const responseTimeLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] * 1e3 + diff[1] / 1e6; // converting to ms
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${duration.toFixed(2)} ms`
    );
  });

  next();
};
