import { z } from "zod";

export const reviewTransactionIdParamSchema = z.object({ id: z.string().uuid() });
export const reviewUserIdParamSchema = z.object({ id: z.string().uuid() });
export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});
