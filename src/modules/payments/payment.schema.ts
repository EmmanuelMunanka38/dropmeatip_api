import { z } from "zod";
import { tanzanianPhoneSchema } from "../../utils/phone.js";

const donationBody = z.object({
  type: z.literal("DONATION"),
  creatorUsername: z
    .string()
    .trim()
    .min(1, "Creator username is required")
    .transform((value) => value.toLowerCase()),
  amountTzs: z
    .number()
    .int("Amount must be a whole number")
    .positive("Amount must be positive"),
  phone: tanzanianPhoneSchema,
  supporterName: z.string().trim().min(1).max(100),
  message: z.string().trim().max(500).optional(),
});

const membershipBody = z.object({
  type: z.literal("MEMBERSHIP"),
  tierId: z.string().uuid("Invalid tier id"),
  phone: tanzanianPhoneSchema,
  supporterName: z.string().trim().min(1).max(100),
  message: z.string().trim().max(500).optional(),
});

export const initiatePaymentSchema = z.discriminatedUnion("type", [
  donationBody,
  membershipBody,
]);

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export const webhookSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  status: z.enum(["COMPLETED", "FAILED"]),
});

export type WebhookInput = z.infer<typeof webhookSchema>;

export const transactionParamsSchema = z.object({
  id: z.string().uuid("Invalid transaction id"),
});

export type TransactionParams = z.infer<typeof transactionParamsSchema>;
