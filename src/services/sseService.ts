import { Request, Response } from "express";

interface AuthRequest extends Request {
  user?: any;
}

const orgClients: Record<string, Response[]> = {};

export const deviceEvents = (req: AuthRequest, res: Response) => {
  if (!req.user?.orgId) {
    console.log(req.user);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Add client to org pool
  const orgId = req.user.orgId;
  if (!orgClients[orgId]) orgClients[orgId] = [];
  orgClients[orgId].push(res);

  // Removing when disconnect
  req.on("close", () => {
    orgClients[orgId] = orgClients[orgId].filter((client) => client !== res);
  });
};

// Broadcasting helper
export const broadcastToOrg = (orgId: string, data: any) => {
  if (!orgClients[orgId]) return;
  orgClients[orgId].forEach((res) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};
