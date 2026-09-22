import { z } from "zod";

export const listItemsQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const itemIdParamSchema = z.object({
  id: z.string().uuid(),
});
