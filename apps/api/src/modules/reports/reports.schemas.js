import { z } from "zod";

export const createReportSchema = z.object({
  targetType: z.enum(["ITEM", "USER"]),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(3).max(200),
  details: z.string().trim().max(3000).optional(),
});
export const reportIdParamSchema = z.object({ id: z.string().uuid() });
