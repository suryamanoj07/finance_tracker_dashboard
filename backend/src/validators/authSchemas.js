import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

