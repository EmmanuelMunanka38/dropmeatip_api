import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { sendOtpEmail } from "./email.service.js";
import { HttpError } from "../utils/http-error.js";

export const generateOtpCode = (): string => {
  const min = 10 ** (env.OTP_LENGTH - 1);
  const max = 10 ** env.OTP_LENGTH - 1;
  return randomInt(min, max + 1).toString();
};

const hashOtp = (email: string, code: string): string =>
  createHash("sha256")
    .update(`${email.toLowerCase()}:${code}:${env.OTP_SECRET}`)
    .digest("hex");

export const sendOtp = async (
  email: string,
  fullName: string,
): Promise<{ expiresInMinutes: number }> => {
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.otp.findUnique({
    where: { email: normalizedEmail },
    select: { createdAt: true },
  });

  if (existing) {
    const cooldownMs = env.OTP_RESEND_COOLDOWN_SECONDS * 1000;
    const elapsed = Date.now() - existing.createdAt.getTime();

    if (elapsed < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      throw new HttpError(
        429,
        `Please wait ${waitSeconds} seconds before requesting a new code`,
      );
    }
  }

  const now = new Date();
  const code = generateOtpCode();
  const expiresAt = new Date(
    now.getTime() + env.OTP_EXPIRES_MINUTES * 60 * 1000,
  );
  const hashedCode = hashOtp(normalizedEmail, code);

  if (env.NODE_ENV === "development") {
    console.log(`[dev] OTP for ${normalizedEmail}: ${code}`);
  }

  await prisma.otp.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      code: hashedCode,
      expiresAt,
    },
    update: {
      code: hashedCode,
      expiresAt,
      attempts: 0,
      createdAt: now,
    },
  });

  await sendOtpEmail(normalizedEmail, {
    fullName,
    code,
    expiresInMinutes: env.OTP_EXPIRES_MINUTES,
  });

  return { expiresInMinutes: env.OTP_EXPIRES_MINUTES };
};

export const verifyOtp = async (email: string, code: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase();
  const otp = await prisma.otp.findUnique({
    where: { email: normalizedEmail },
  });

  if (!otp) {
    throw HttpError.badRequest(
      "No verification code found. Please request a new code",
    );
  }

  if (otp.expiresAt.getTime() < Date.now()) {
    await prisma.otp.delete({ where: { id: otp.id } });
    throw HttpError.badRequest(
      "Verification code has expired. Please request a new code",
    );
  }

  if (otp.attempts >= env.OTP_MAX_ATTEMPTS) {
    await prisma.otp.delete({ where: { id: otp.id } });
    throw new HttpError(
      429,
      "Too many failed attempts. Please request a new code",
    );
  }

  const expected = Buffer.from(hashOtp(normalizedEmail, code), "utf8");
  const actual = Buffer.from(otp.code, "utf8");
  const matches =
    expected.length === actual.length && timingSafeEqual(expected, actual);

  if (!matches) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    throw HttpError.badRequest("Invalid verification code");
  }

  await prisma.otp.delete({ where: { id: otp.id } });
};
