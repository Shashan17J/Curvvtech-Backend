import {
  registerDevice,
  listDevices,
  updateDevice,
  deleteDevice,
  heartbeatDevice,
} from "../src/controllers/deviceManagementController";
import Device from "../src/models/device";
import User from "../src/models/user";

jest.mock("../src/models/device");
jest.mock("../src/models/user");

const mockReq = (data: any = {}) => ({
  body: data.body || {},
  params: data.params || {},
  user: data.user || {},
});

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Device Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- register ----------------
  describe("registerDevice", () => {
    it("should return 403 if validation fails", async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      await registerDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should return 401 if no user", async () => {
      const req = mockReq({
        body: { name: "Lamp", type: "light", status: "active" },
        user: {},
      });
      const res = mockRes();

      await registerDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should return 404 if user not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      const req = mockReq({
        body: { name: "Lamp", type: "light", status: "active" },
        user: { id: "u1" },
      });
      const res = mockRes();

      await registerDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should register device successfully", async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ userId: "u1" });
      (Device.create as jest.Mock).mockResolvedValue({
        deviceId: "d1",
        name: "Lamp",
        type: "light",
        status: "active",
        last_active_at: null,
        owner_id: "u1",
        save: jest.fn(),
      });

      const req = mockReq({
        body: { name: "Lamp", type: "light", status: "active" },
        user: { id: "u1" },
      });
      const res = mockRes();

      await registerDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: true,
          device: expect.objectContaining({
            id: "d1",
            name: "Lamp",
            type: "light",
            status: "active",
            owner_id: "u1",
          }),
        })
      );
    });
  });

  // ---------------- list ----------------
  describe("listDevices", () => {
    it("should return 403 if validation fails", async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      await listDevices(req as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should return devices successfully", async () => {
      (Device.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            id: "d1",
            name: "Lamp",
            type: "light",
            status: "active",
            last_active_at: null,
            owner_id: { userId: "u1", name: "John", email: "john@test.com" },
          },
        ]),
      });

      const req = mockReq({ body: { type: "light", status: "active" } });
      const res = mockRes();

      await listDevices(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          devices: expect.any(Array),
        })
      );
    });
  });

  // ---------------- update ----------------
  describe("updateDevice", () => {
    it("should return 403 if validation fails", async () => {
      const req = mockReq({ params: {} });
      const res = mockRes();

      await updateDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should return 404 if device not found", async () => {
      (Device.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const req = mockReq({
        params: { id: "d1" },
        body: { status: "active" },
      });
      const res = mockRes();

      await updateDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should update device successfully", async () => {
      (Device.findOneAndUpdate as jest.Mock).mockResolvedValue({
        id: "d1",
        name: "Lamp",
        type: "light",
        status: "active",
        last_active_at: new Date(),
        owner_id: "u1",
      });

      const req = mockReq({
        params: { id: "d1" },
        body: { status: "active" },
      });
      const res = mockRes();

      await updateDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          device: expect.any(Object),
        })
      );
    });
  });

  // ---------------- delete ----------------
  describe("deleteDevice", () => {
    it("should return 403 if validation fails", async () => {
      const req = mockReq({ params: {} });
      const res = mockRes();

      await deleteDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should return 404 if device not found", async () => {
      (Device.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      const req = mockReq({ params: { id: "d1" } });
      const res = mockRes();

      await deleteDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should delete device successfully", async () => {
      (Device.findOneAndDelete as jest.Mock).mockResolvedValue({ id: "d1" });

      const req = mockReq({ params: { id: "d1" } });
      const res = mockRes();

      await deleteDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Device deleted successfully",
        })
      );
    });
  });

  // ---------------- heartbeat ----------------
  describe("heartbeatDevice", () => {
    it("should return 403 if validation fails", async () => {
      const req = mockReq({ params: {} });
      const res = mockRes();

      await heartbeatDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should return 404 if device not found", async () => {
      (Device.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const req = mockReq({ params: { id: "d1" } });
      const res = mockRes();

      await heartbeatDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should record heartbeat successfully", async () => {
      const now = new Date();
      (Device.findOneAndUpdate as jest.Mock).mockResolvedValue({
        id: "d1",
        last_active_at: now,
      });

      const req = mockReq({ params: { id: "d1" } });
      const res = mockRes();

      await heartbeatDevice(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Device heartbeat recorded",
          last_active_at: now,
        })
      );
    });
  });
});
