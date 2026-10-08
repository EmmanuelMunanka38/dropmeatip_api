import { z } from "zod";
import { tanzanianPhoneSchema } from "../../utils/phone.js";

export const withdrawSchema = z.object({
  amountTzs: z
    .number()
    .int("Amount must be a whole number")
    .positive("Amount must be positive"),
  phone: tanzanianPhoneSchema,
});

export type WithdrawInput = z.infer<typeof withdrawSchema>;

export const ledgerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type LedgerQuery = z.infer<typeof ledgerQuerySchema>;
