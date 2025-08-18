import mongoose, { Document, Model } from "mongoose";
import { IDeviceLog } from "../interface/interface";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose as any);

const deviceLogSchema = new mongoose.Schema<IDeviceLog>(
  {
    logId: {
      type: String,
      unique: true,
    },
    event: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now || null,
    },
  },
  { timestamps: true }
);

deviceLogSchema.plugin(AutoIncrement as any, {
  inc_field: "logNumber",
  start_seq: 1,
});

deviceLogSchema.pre("save", function (next) {
  if (!this.logId && this.logNumber) {
    this.logId = `l${this.logNumber}`;
  }
  next();
});

const DeviceLog: Model<IDeviceLog> = mongoose.model<IDeviceLog>(
  "DeviceLog",
  deviceLogSchema
);

export default DeviceLog;
