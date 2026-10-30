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

const imageUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (val.startsWith("data:image/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid HTTP(S) URL or image data URI" },
  )
  .and(z.string().max(2000000));
const itemFields = {
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  categoryId: z.string().uuid(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  pricePerDay: z.coerce.number().finite().min(0).max(1000000),
  rules: z.string().trim().max(2000).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  images: z.array(imageUrlSchema).max(10),
};

export const createItemSchema = z.object(itemFields);

export const updateItemSchema = z.object({
  ...Object.fromEntries(Object.entries(itemFields).map(([key, value]) => [key, value.optional()])),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one field must be provided.",
});
