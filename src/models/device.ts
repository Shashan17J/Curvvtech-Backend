import mongoose, { Document, Model } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
const AutoIncrement = AutoIncrementFactory(mongoose as any);
import { IDevice } from "../interface/interface";

const deviceSchema = new mongoose.Schema<IDevice>(
  {
    deviceId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["light", "fan", "ac", "tv", "other"],
    },
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    },
    last_active_at: { type: Date },

    owner_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// indexing
deviceSchema.index({ deviceId: 1 }, { unique: true });

deviceSchema.plugin(AutoIncrement as any, {
  inc_field: "deviceNumber",
  start_seq: 1,
});

deviceSchema.pre("save", function (next) {
  if (!this.deviceId && this.deviceNumber) {
    this.deviceId = `d${this.deviceNumber}`;
  }
  next();
});

const Device: Model<IDevice> = mongoose.model<IDevice>("Device", deviceSchema);

export default Device;
