import { z } from 'zod';

export const categorySlugSchema = z.object({
  slug: z.string().trim().min(1)
});
