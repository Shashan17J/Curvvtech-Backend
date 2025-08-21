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

export const getCsvJsonLogsQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a positive number",
    }),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "startDate must be a valid date string",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "endDate must be a valid date string",
    }),
});

export const getUsageParamsSchema = z.object({
  id: z.string().min(1, { message: "id is required" }),
});

export const getUsageQuerySchema = z.object({
  range: z.enum(["24h", "48h", "72h"]).default("24h"),
});

export const getExportQuerySchema = z.object({
  jobId: z.string().min(1, { message: "jobId is required" }),
});
