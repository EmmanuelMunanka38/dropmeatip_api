import type { Request, Response } from "express";
import { validated } from "../../middleware/validate.middleware.js";
import { successResponse } from "../../utils/api-response.js";
import * as creatorService from "./creator.service.js";
import type {
  CreateTierInput,
  TierIdParams,
  UpdateProfileInput,
  UpdateTierInput,
  UsernameParams,
} from "./creator.schema.js";

export const getPublicProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { username } = validated<UsernameParams>(res, "params");
  const profile = await creatorService.getPublicProfile(username);
  res.status(200).json(successResponse(profile));
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const profile = await creatorService.updateProfile(
    req.user!.id,
    req.body as UpdateProfileInput,
  );
  res.status(200).json(successResponse(profile, "Profile updated"));
};

export const createTier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const tier = await creatorService.createTier(
    req.user!.id,
    req.body as CreateTierInput,
  );
  res.status(201).json(successResponse(tier, "Tier created"));
};

export const listMyTiers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const tiers = await creatorService.listMyTiers(req.user!.id);
  res.status(200).json(successResponse(tiers));
};

export const updateTier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = validated<TierIdParams>(res, "params");
  const tier = await creatorService.updateTier(
    req.user!.id,
    id,
    req.body as UpdateTierInput,
  );
  res.status(200).json(successResponse(tier, "Tier updated"));
};

export const deleteTier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = validated<TierIdParams>(res, "params");
  await creatorService.deleteTier(req.user!.id, id);
  res.status(200).json(successResponse(null, "Tier deleted"));
};
