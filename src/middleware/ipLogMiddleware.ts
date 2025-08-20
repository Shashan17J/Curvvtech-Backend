import { Request, Response, NextFunction } from "express";
import requestIp from "request-ip";

export const ipLogger = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = requestIp.getClientIp(req);
  console.log(`Client IP: ${clientIp}`);
  next();
};
