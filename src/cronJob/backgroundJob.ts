import Device from "../models/device";
import cron from "node-cron";

cron.schedule(
  "0 * * * *",
  async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const result = await Device.updateMany(
        { last_active_at: { $lt: cutoff }, status: "active" },
        // just for testing is it working or not
        // {
        //   status: "active",
        //   $or: [{ last_active_at: null }, { last_active_at: { $lt: cutoff } }],
        // },
        { $set: { status: "deactive" } }
      );

      console.log(`Deactivated ${result.modifiedCount} devices`);
    } catch (err) {
      console.error("Error auto-deactivating devices:", err);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
