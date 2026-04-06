import { z } from "zod";
import { USER_ROLES, USER_STATUSES } from "../models/User.js";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    role: z.enum(USER_ROLES).default("viewer"),
    status: z.enum(USER_STATUSES).default("active"),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(80).optional(),
      role: z.enum(USER_ROLES).optional(),
      status: z.enum(USER_STATUSES).optional(),
      password: z.string().min(6).max(100).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Provide at least one field" }),
  params: z.object({
    userId: z.string().min(1),
  }),
  query: z.any().optional(),
});

