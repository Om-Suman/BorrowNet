import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(2).max(50),
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const googleAuthSchema = z
  .object({
    credential: z.string().min(1).max(10000),
  })
  .strict();
