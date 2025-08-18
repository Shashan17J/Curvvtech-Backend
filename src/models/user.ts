import mongoose, { Document, Model } from "mongoose";
import { IUser } from "../interface/interface";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose as any);

const userSchema = new mongoose.Schema<IUser>(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.plugin(AutoIncrement as any, { inc_field: "userNumber" });

userSchema.post("save", async function (doc, next) {
  if (!doc.userId && doc.userNumber) {
    doc.userId = `u${doc.userNumber}`;
    await doc.save();
  }
  next();
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
