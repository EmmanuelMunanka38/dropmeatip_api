import { randomBytes } from "node:crypto";
import { prisma } from "../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { sendPayoutStatusEmail } from "../../services/email.service.js";
import { HttpError } from "../../utils/http-error.js";
import type { LedgerQuery, WithdrawInput } from "./wallet.schema.js";

type BalanceClient = Prisma.TransactionClient;

const calculateWalletBalance = async (
  client: BalanceClient,
  walletId: string,
): Promise<number> => {
  const groups = await client.walletLedger.groupBy({
    by: ["type"],
    where: { walletId },
    _sum: { amountTzs: true },
  });

  return groups.reduce((balance, group) => {
    const sum = group._sum.amountTzs ?? 0;
    return group.type === "CREDIT" ? balance + sum : balance - sum;
  }, 0);
};

export const getBalance = async (userId: string) => {
  const wallet = await prisma.wallet.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const balance = await calculateWalletBalance(prisma, wallet.id);

  return { balance };
};

export const listLedger = async (
  userId: string,
  query: LedgerQuery,
) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!wallet) {
    return { entries: [], total: 0, page: query.page, limit: query.limit };
  }

  const where = { walletId: wallet.id };
  const [entries, total] = await Promise.all([
    prisma.walletLedger.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        type: true,
        amountTzs: true,
        description: true,
        reference: true,
        createdAt: true,
      },
    }),
    prisma.walletLedger.count({ where }),
  ]);

  return { entries, total, page: query.page, limit: query.limit };
};

export const withdraw = async (
  userId: string,
  input: WithdrawInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true },
  });

  if (!user) {
    throw HttpError.notFound("User not found");
  }

  const reference = `PAY-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;

  const result = await prisma.$transaction(
    async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      const balance = await calculateWalletBalance(tx, wallet.id);

      if (balance < input.amountTzs) {
        throw HttpError.unprocessable(
          `Insufficient balance. Available: TZS ${balance.toLocaleString("en-US")}`,
        );
      }

      const payout = await tx.payout.create({
        data: {
          userId,
          amountTzs: input.amountTzs,
          phone: input.phone,
          status: "PENDING",
          reference,
        },
      });

      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: "DEBIT",
          amountTzs: input.amountTzs,
          description: "Payout withdrawal",
          reference,
          payoutId: payout.id,
        },
      });

      const newBalance = await calculateWalletBalance(tx, wallet.id);

      return { payout, newBalance };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  await sendPayoutStatusEmail(user.email, {
    creatorName: user.fullName,
    amountTzs: input.amountTzs,
    phone: input.phone,
    status: result.payout.status,
  });

  return result;
};
