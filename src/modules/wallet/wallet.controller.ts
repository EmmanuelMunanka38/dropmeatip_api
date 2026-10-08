import type { Request, Response } from "express";
import { validated } from "../../middleware/validate.middleware.js";
import { successResponse } from "../../utils/api-response.js";
import * as walletService from "./wallet.service.js";
import type { LedgerQuery, WithdrawInput } from "./wallet.schema.js";

export const getBalance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await walletService.getBalance(req.user!.id);
  res.status(200).json(successResponse(result));
};

export const getLedger = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = validated<LedgerQuery>(res, "query");
  const result = await walletService.listLedger(req.user!.id, query);
  res.status(200).json(successResponse(result));
};

export const withdraw = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await walletService.withdraw(
    req.user!.id,
    req.body as WithdrawInput,
  );
  res.status(200).json(
    successResponse(result, "Payout requested successfully"),
  );
};
