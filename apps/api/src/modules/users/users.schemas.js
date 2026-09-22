import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  bio: z.string().trim().max(500).optional(),
  location: z.string().trim().max(100).optional(),
  avatarUrl: z.string().url().optional()
}).strict().refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be updated."
});

export const paramsIdSchema = z.object({
  id: z.string().uuid()
});
