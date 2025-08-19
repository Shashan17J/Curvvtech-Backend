import { z } from "zod";

export const createLogsParamsSchema = z.object({
  id: z.string().min(1, { message: "id is required" }),
});

export const createLogsBodySchema = z.object({
  event: z.string().min(1, { message: "event is required" }),
  value: z.number().nonnegative({ message: "Value must be >= 0" }),
});

export const getLogsParamsSchema = z.object({
  id: z.string().min(1, { message: "id is required" }),
});

export const getLogsQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a positive number",
    }),
});

export const getUsageParamsSchema = z.object({
  id: z.string().min(1, { message: "id is required" }),
});

export const getUsageQuerySchema = z.object({
  range: z.enum(["24h", "7d", "30d"]).default("24h"),
});
