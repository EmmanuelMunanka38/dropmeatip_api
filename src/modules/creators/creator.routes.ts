import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as creatorController from "./creator.controller.js";
import {
  createTierSchema,
  tierIdParamsSchema,
  updateProfileSchema,
  updateTierSchema,
  usernameParamsSchema,
} from "./creator.schema.js";

const router = Router();

router.get(
  "/:username",
  validate(usernameParamsSchema, "params"),
  creatorController.getPublicProfile,
);

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  creatorController.updateProfile,
);

router.post(
  "/tiers",
  authenticate,
  validate(createTierSchema),
  creatorController.createTier,
);

router.get("/tiers/my-tiers", authenticate, creatorController.listMyTiers);

router.patch(
  "/tiers/:id",
  authenticate,
  validate(tierIdParamsSchema, "params"),
  validate(updateTierSchema),
  creatorController.updateTier,
);

router.delete(
  "/tiers/:id",
  authenticate,
  validate(tierIdParamsSchema, "params"),
  creatorController.deleteTier,
);

export default router;
