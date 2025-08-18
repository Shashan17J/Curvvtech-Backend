import { z } from "zod";

export const registerDeviceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["light", "fan", "ac", "tv", "other"], {
    message: "Device type is required",
  }),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const listDeviceSchema = z.object({
  type: z.enum(["light", "fan", "ac", "tv", "other"], {
    message: "Device type is required",
  }),
  status: z.enum(["active", "deactive"]),
});

export const updateDeviceSchema = z.object({
  id: z.string().min(2, { message: "id is required" }),
});

export const deleteDeviceSchema = z.object({
  id: z.string().min(2, { message: "id is required" }),
});

export const heartbeatDeviceSchema = z.object({
  id: z.string().min(2, { message: "id is required" }),
});
