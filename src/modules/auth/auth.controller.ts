import type { Request, Response } from "express";
import { successResponse } from "../../utils/api-response.js";
import * as authService from "./auth.service.js";
import type {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  VerifyOtpInput,
} from "./auth.schema.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { userId } = await authService.register(req.body as RegisterInput);
  res.status(201).json(
    successResponse({ userId }, "Verification code sent to your email"),
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  await authService.requestLoginOtp(req.body as LoginInput);
  res.status(200).json(
    successResponse(null, "Verification code sent to your email"),
  );
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.verifyOtp(req.body as VerifyOtpInput);
  res.status(200).json(successResponse(result, "Email verified"));
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { refreshToken } = req.body as RefreshTokenInput;
  const tokens = await authService.refreshTokens(refreshToken);
  res.status(200).json(successResponse(tokens, "Token refreshed"));
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(successResponse(null, "Logged out successfully"));
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.getMe(req.user!.id);
  res.status(200).json(successResponse(user, "Profile retrieved"));
};
