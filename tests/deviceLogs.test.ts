import {
  createLog,
  getLogs,
  getUsage,
} from "../src/controllers/deviceLogsController";
import Device from "../src/models/device";
import DeviceLog from "../src/models/deviceLogs";

jest.mock("../src/models/device");
jest.mock("../src/models/deviceLogs");

const mockReq = (data: any = {}) => ({ ...data }) as any;
const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Device Logs Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------createLog-------
  describe("createLog", () => {
    it("should return 404 if device not found", async () => {
      (Device.findOne as jest.Mock).mockResolvedValue(null);

      const req = mockReq({
        params: { id: "d1" },
        body: { event: "units_consumed", value: 1 },
      });
      const res = mockRes();

      await createLog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Device not found",
      });
    });

    it("should create a log successfully", async () => {
      (Device.findOne as jest.Mock).mockResolvedValue({ deviceId: "d1" });

      const fakeLog = {
        logId: "l1",
        event: "units_consumed",
        value: 1,
        timestamp: new Date("2025-08-17T10:00:00Z"),
        save: jest.fn(),
      };

      (DeviceLog.create as jest.Mock).mockResolvedValue(fakeLog);

      const req = mockReq({
        params: { id: "d1" },
        body: { event: "units_consumed", value: 1 },
      });
      const res = mockRes();

      await createLog(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Log Created Successfully",
        logs: {
          id: fakeLog.logId,
          event: fakeLog.event,
          value: fakeLog.value,
          timestamp: fakeLog.timestamp,
        },
      });
    });
  });

  // ------getLogs-------
  describe("getLogs", () => {
    it("should return 404 if device not found", async () => {
      (Device.findOne as jest.Mock).mockResolvedValue(null);

      const req = mockReq({ params: { id: "d69" }, query: { limit: "10" } });
      const res = mockRes();

      await getLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Device not found",
      });
    });

    it("should return logs successfully", async () => {
      (Device.findOne as jest.Mock).mockResolvedValue({ deviceId: "d1" });
      (DeviceLog.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          {
            logId: "l1",
            event: "units_consumed",
            value: 2.5,
            timestamp: "2025-08-17T08:00:00Z",
          },
          {
            logId: "l2",
            event: "units_consumed",
            value: 1.2,
            timestamp: "2025-08-17T09:00:00Z",
          },
        ]),
      });

      const req = mockReq({ params: { id: "d1" }, query: { limit: "5" } });
      const res = mockRes();

      await getLogs(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          logs: expect.any(Array),
        })
      );
    });
  });

  // ------getUsage-------
  describe("getUsage", () => {
    it("should return 404 if device not found", async () => {
      (Device.findOne as jest.Mock).mockResolvedValue(null);

      const req = mockReq({ params: { id: "d100" }, query: { range: "24h" } });
      const res = mockRes();

      await getUsage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Device not found",
      });
    });

    it("should return total usage", async () => {
      (Device.findOne as jest.Mock).mockResolvedValue({
        deviceId: "d1",
      });
      (DeviceLog.aggregate as jest.Mock).mockResolvedValue([
        { totalUnits: 10 },
      ]);

      const req = mockReq({ params: { id: "d1" }, query: { range: "24h" } });
      const res = mockRes();

      await getUsage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, total_units_last_24h: 10 })
      );
    });
  });
});
