import { randomBytes } from "node:crypto";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { sendDonationReceivedEmail } from "../../services/email.service.js";
import { HttpError } from "../../utils/http-error.js";
import type {
  InitiatePaymentInput,
  WebhookInput,
} from "./payment.schema.js";

export interface MobileMoneyPushResult {
  provider: string;
  reference: string;
  status: "PENDING";
  message: string;
}

const generateReference = (prefix: string): string =>
  `${prefix}-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;

const computeFee = (amountTzs: number): number =>
  Math.round((amountTzs * env.PLATFORM_FEE_PERCENT) / 100);

export const triggerMobileMoneyPush = (
  phone: string,
  amountTzs: number,
  reference: string,
): MobileMoneyPushResult => {
  return {
    provider: "mock",
    reference,
    status: "PENDING",
    message: `USSD push sent to ${phone}. Enter your PIN to complete TZS ${amountTzs.toLocaleString("en-US")}.`,
  };
};

export const initiatePayment = async (input: InitiatePaymentInput) => {
  let creatorId: string;
  let amountTzs: number;
  let tierId: string | null = null;

  if (input.type === "MEMBERSHIP") {
    const tier = await prisma.membershipTier.findFirst({
      where: { id: input.tierId, isActive: true },
      select: { id: true, creatorId: true, priceTzs: true },
    });

    if (!tier) {
      throw HttpError.notFound("Membership tier not found or inactive");
    }

    creatorId = tier.creatorId;
    amountTzs = tier.priceTzs;
    tierId = tier.id;
  } else {
    const creator = await prisma.user.findUnique({
      where: { username: input.creatorUsername },
      select: { id: true },
    });

    if (!creator) {
      throw HttpError.notFound("Creator not found");
    }

    creatorId = creator.id;
    amountTzs = input.amountTzs;
  }

  const feeTzs = computeFee(amountTzs);
  const netAmountTzs = amountTzs - feeTzs;
  const reference = generateReference("TXN");

  const transaction = await prisma.transaction.create({
    data: {
      reference,
      type: input.type,
      amountTzs,
      feeTzs,
      netAmountTzs,
      phone: input.phone,
      message: input.message,
      supporterName: input.supporterName,
      creatorId,
      tierId,
      status: "PENDING",
    },
  });

  const push = triggerMobileMoneyPush(input.phone, amountTzs, reference);

  return { transaction, push };
};

export const handleWebhook = async (input: WebhookInput) => {
  const transaction = await prisma.transaction.findUnique({
    where: { reference: input.reference },
    include: {
      creator: { select: { id: true, email: true, fullName: true } },
      tier: { select: { title: true } },
    },
  });

  if (!transaction) {
    throw HttpError.notFound("Transaction not found");
  }

  if (transaction.status === "COMPLETED") {
    return transaction;
  }

  if (input.status === "FAILED") {
    if (transaction.status === "PENDING") {
      return prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
    }
    return transaction;
  }

  const completed = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId: transaction.creatorId },
      create: { userId: transaction.creatorId },
      update: {},
    });

    await tx.transaction.update({
      where: { id: transaction.id },
      data: { status: "COMPLETED" },
    });

    const description =
      transaction.type === "MEMBERSHIP" && transaction.tier
        ? `Membership - ${transaction.tier.title}`
        : `Donation from ${transaction.supporterName}`;

    await tx.walletLedger.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT",
        amountTzs: transaction.amountTzs,
        description,
        reference: transaction.reference,
        transactionId: transaction.id,
      },
    });

    if (transaction.feeTzs > 0) {
      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: "FEE",
          amountTzs: transaction.feeTzs,
          description: "Platform fee",
          reference: transaction.reference,
          transactionId: transaction.id,
        },
      });
    }

    if (transaction.type === "MEMBERSHIP" && transaction.tierId) {
      await tx.userMembership.create({
        data: {
          creatorId: transaction.creatorId,
          tierId: transaction.tierId,
          supporterName: transaction.supporterName,
          supporterPhone: transaction.phone,
          transactionId: transaction.id,
        },
      });
    }

    return tx.transaction.findUnique({ where: { id: transaction.id } });
  });

  await sendDonationReceivedEmail(transaction.creator.email, {
    creatorName: transaction.creator.fullName,
    supporterName: transaction.supporterName,
    amountTzs: transaction.amountTzs,
    message: transaction.message ?? undefined,
  });

  return completed;
};

export const getTransaction = async (id: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    select: {
      id: true,
      reference: true,
      type: true,
      amountTzs: true,
      feeTzs: true,
      netAmountTzs: true,
      status: true,
      supporterName: true,
      message: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!transaction) {
    throw HttpError.notFound("Transaction not found");
  }

  return transaction;
};
