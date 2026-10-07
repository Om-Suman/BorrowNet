import { z } from "zod";

const dateTime = z.string().datetime({ offset: true });

export const itemIdParamSchema = z.object({ id: z.string().uuid() });
export const requestIdParamSchema = z.object({ id: z.string().uuid() });

export const createRequestSchema = z.object({
  startDate: dateTime,
  endDate: dateTime,
  note: z.string().trim().max(1000).optional(),
}).refine((value) => new Date(value.endDate) > new Date(value.startDate), {
  message: "endDate must be after startDate.",
  path: ["endDate"],
});

export const listRequestsQuerySchema = z.object({
  role: z.enum(["borrower", "lender"]).default("borrower"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"]).optional(),
});

export const rejectRequestSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
}).default({});
