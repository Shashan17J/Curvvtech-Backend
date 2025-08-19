import mongoose from "mongoose";

export interface IUser extends Document {
  userId: string;
  name: string;
  email?: string;
  password: string;
  role: "user" | "admin";
  userNumber?: number;
}

export interface IDeviceLog extends Document {
  logId: string;
  event: string;
  value: number;
  deviceId: string;
  timestamp: Date;
  logNumber?: number;
}

export interface IDevice extends Document {
  deviceId: string;
  name: string;
  type: "light" | "fan" | "ac" | "tv" | "other";
  status: "active" | "inactive";
  last_active_at: Date | null;
  owner_id: string;
  deviceNumber?: number;
}
