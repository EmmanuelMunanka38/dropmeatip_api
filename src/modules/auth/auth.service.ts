import { prisma } from "../../config/db.js";
import { sendWelcomeEmail } from "../../services/email.service.js";
import * as otpService from "../../services/otp.service.js";
import { HttpError } from "../../utils/http-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import type {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
} from "./auth.schema.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  username: string;
  isVerified: boolean;
  bio: string | null;
  avatarUrl: string | null;
  unitName: string;
  unitPriceTzs: number;
  payoutPhone: string | null;
  createdAt: Date;
}

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  username: true,
  isVerified: true,
  bio: true,
  avatarUrl: true,
  unitName: true,
  unitPriceTzs: true,
  payoutPhone: true,
  createdAt: true,
} as const;

const toSafeUser = (user: {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  username: string;
  isVerified: boolean;
  bio: string | null;
  avatarUrl: string | null;
  unitName: string;
  unitPriceTzs: number;
  payoutPhone: string | null;
  createdAt: Date;
}): SafeUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone,
  username: user.username,
  isVerified: user.isVerified,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  unitName: user.unitName,
  unitPriceTzs: user.unitPriceTzs,
  payoutPhone: user.payoutPhone,
  createdAt: user.createdAt,
});

const buildTokens = (user: {
  id: string;
  email: string;
  username: string;
}): AuthTokens => ({
  accessToken: generateAccessToken({
    sub: user.id,
    email: user.email,
    username: user.username,
  }),
  refreshToken: generateRefreshToken(user.id),
});

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20) || "creator";

const generateUniqueUsername = async (fullName: string): Promise<string> => {
  const base = slugify(fullName);
  let username = base;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}${suffix}`;
    suffix += 1;
  }

  return username;
};

export const register = async (
  input: RegisterInput,
): Promise<{ userId: string }> => {
  const email = input.email.toLowerCase();

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, fullName: true, isVerified: true },
  });

  if (existingByEmail) {
    if (existingByEmail.isVerified) {
      throw HttpError.conflict("An account with this email already exists");
    }

    await otpService.sendOtp(existingByEmail.email, existingByEmail.fullName);
    return { userId: existingByEmail.id };
  }

  const existingByPhone = await prisma.user.findUnique({
    where: { phone: input.phone },
    select: { id: true },
  });

  if (existingByPhone) {
    throw HttpError.conflict("An account with this phone number already exists");
  }

  const username = await generateUniqueUsername(input.fullName);

  const user = await prisma.user.create({
    data: {
      email,
      fullName: input.fullName,
      phone: input.phone,
      username,
    },
    select: { id: true, email: true, fullName: true },
  });

  await otpService.sendOtp(user.email, user.fullName);

  return { userId: user.id };
};

export const requestLoginOtp = async (input: LoginInput): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true, email: true, fullName: true },
  });

  if (!user) {
    throw HttpError.notFound("No account found with this email");
  }

  await otpService.sendOtp(user.email, user.fullName);
};

export const verifyOtp = async (
  input: VerifyOtpInput,
): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (!existing) {
    throw HttpError.notFound("No account found with this email");
  }

  await otpService.verifyOtp(email, input.code);

  const wasVerified = existing.isVerified;

  const user = await prisma.user.update({
    where: { id: existing.id },
    data: { isVerified: true },
    select: SAFE_USER_SELECT,
  });

  if (!wasVerified) {
    await sendWelcomeEmail(user.email, {
      fullName: user.fullName,
      username: user.username,
    });
  }

  return { user: toSafeUser(user), tokens: buildTokens(user) };
};

export const refreshTokens = async (
  refreshToken: string,
): Promise<AuthTokens> => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw HttpError.unauthorized("Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw HttpError.unauthorized("Invalid token type");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    throw HttpError.unauthorized("User account no longer exists");
  }

  return buildTokens(user);
};

export const getMe = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  if (!user) {
    throw HttpError.notFound("User not found");
  }

  return toSafeUser(user);
};
