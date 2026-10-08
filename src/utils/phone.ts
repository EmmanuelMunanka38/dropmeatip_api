import { z } from "zod";

const TANZANIA_MOBILE_REGEX = /^255[67]\d{8}$/;
const LOCAL_MOBILE_REGEX = /^0[67]\d{8}$/;

export const sanitizeTanzanianPhone = (raw: string): string => {
  let phone = raw.replace(/[\s\-().]+/g, "");

  if (phone.startsWith("+")) {
    phone = phone.slice(1);
  } else if (phone.startsWith("00")) {
    phone = phone.slice(2);
  }

  if (LOCAL_MOBILE_REGEX.test(phone)) {
    phone = `255${phone.slice(1)}`;
  }

  if (!TANZANIA_MOBILE_REGEX.test(phone)) {
    throw new Error(
      `Invalid Tanzanian phone number "${raw}". Expected 07XXXXXXXX, +2557XXXXXXXX or 2557XXXXXXXX.`,
    );
  }

  return phone;
};

export const tanzanianPhoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    try {
      return sanitizeTanzanianPhone(value);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Invalid Tanzanian phone number. Expected 07XXXXXXXX, +2557XXXXXXXX or 2557XXXXXXXX.",
      });
      return z.NEVER;
    }
  });
