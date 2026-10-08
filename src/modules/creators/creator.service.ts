import { prisma } from "../../config/db.js";
import { HttpError } from "../../utils/http-error.js";
import type {
  CreateTierInput,
  UpdateProfileInput,
  UpdateTierInput,
} from "./creator.schema.js";

const PUBLIC_PROFILE_SELECT = {
  id: true,
  username: true,
  fullName: true,
  bio: true,
  avatarUrl: true,
  unitName: true,
  unitPriceTzs: true,
  createdAt: true,
} as const;

export const getPublicProfile = async (username: string) => {
  const creator = await prisma.user.findUnique({
    where: { username },
    select: {
      ...PUBLIC_PROFILE_SELECT,
      tiers: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          priceTzs: true,
          description: true,
        },
        orderBy: { priceTzs: "asc" },
      },
      _count: {
        select: { memberships: true },
      },
    },
  });

  if (!creator) {
    throw HttpError.notFound("Creator not found");
  }

  return {
    ...creator,
    supporterCount: creator._count.memberships,
  };
};

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
) => {
  const creator = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: PUBLIC_PROFILE_SELECT,
  });

  return creator;
};

export const createTier = async (userId: string, input: CreateTierInput) => {
  return prisma.membershipTier.create({
    data: {
      creatorId: userId,
      title: input.title,
      priceTzs: input.priceTzs,
      description: input.description,
    },
  });
};

export const listMyTiers = async (userId: string) => {
  return prisma.membershipTier.findMany({
    where: { creatorId: userId },
    orderBy: [{ isActive: "desc" }, { priceTzs: "asc" }],
  });
};

export const updateTier = async (
  userId: string,
  tierId: string,
  input: UpdateTierInput,
) => {
  const tier = await prisma.membershipTier.findFirst({
    where: { id: tierId, creatorId: userId },
    select: { id: true },
  });

  if (!tier) {
    throw HttpError.notFound("Tier not found");
  }

  return prisma.membershipTier.update({
    where: { id: tierId },
    data: input,
  });
};

export const deleteTier = async (userId: string, tierId: string) => {
  const tier = await prisma.membershipTier.findFirst({
    where: { id: tierId, creatorId: userId },
    select: { id: true },
  });

  if (!tier) {
    throw HttpError.notFound("Tier not found");
  }

  await prisma.membershipTier.delete({ where: { id: tierId } });
};
