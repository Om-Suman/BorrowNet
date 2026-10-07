import { z } from "zod";
export const adminReportStatusSchema = z.object({ status: z.enum(["RESOLVED", "DISMISSED"]) });
export const adminUserStatusSchema = z.object({ isSuspended: z.boolean() });
export const adminItemStatusSchema = z.object({ status: z.enum(["ACTIVE", "PAUSED", "REMOVED"]) });
export const adminIdParamSchema = z.object({ id: z.string().uuid() });
