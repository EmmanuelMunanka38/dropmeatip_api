import { z } from "zod";
import { tanzanianPhoneSchema } from "../../utils/phone.js";

export const usernameParamsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .transform((value) => value.toLowerCase()),
});

export type UsernameParams = z.infer<typeof usernameParamsSchema>;

export const tierIdParamsSchema = z.object({
  id: z.string().uuid("Invalid tier id"),
});

export type TierIdParams = z.infer<typeof tierIdParamsSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  unitName: z.string().trim().min(1).max(50).optional(),
  unitPriceTzs: z.number().int().min(100).max(10000000).optional(),
  payoutPhone: tanzanianPhoneSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createTierSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(100),
  priceTzs: z.number().int().positive("Price must be a positive integer"),
  description: z.string().trim().max(500).optional(),
});

export type CreateTierInput = z.infer<typeof createTierSchema>;

export const updateTierSchema = z.object({
  title: z.string().trim().min(2).max(100).optional(),
  priceTzs: z.number().int().positive().optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateTierInput = z.infer<typeof updateTierSchema>;
