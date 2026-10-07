import { z } from "zod";

export const relatedItemsQuerySchema = z.object({
  itemId: z.string().uuid().optional(),
  q: z.string().trim().min(2).max(120).optional(),
  limit: z.coerce.number().int().positive().max(20).default(6),
}).refine(({ itemId, q }) => Boolean(itemId || q), {
  message: "Provide itemId or q.",
});
