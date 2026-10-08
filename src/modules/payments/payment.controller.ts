import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { validated } from "../../middleware/validate.middleware.js";
import { successResponse } from "../../utils/api-response.js";
import { HttpError } from "../../utils/http-error.js";
import * as paymentService from "./payment.service.js";
import type {
  InitiatePaymentInput,
  TransactionParams,
  WebhookInput,
} from "./payment.schema.js";

export const verifyWebhookSecret = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const secret = req.headers["x-webhook-secret"];

  if (typeof secret !== "string" || secret !== env.WEBHOOK_SECRET) {
    next(HttpError.forbidden("Invalid webhook secret"));
    return;
  }

  next();
};

export const initiatePayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await paymentService.initiatePayment(
    req.body as InitiatePaymentInput,
  );
  res.status(201).json(
    successResponse(result, "Payment initiated, awaiting confirmation"),
  );
};

export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const transaction = await paymentService.handleWebhook(
    req.body as WebhookInput,
  );
  res.status(200).json(successResponse(transaction, "Webhook processed"));
};

export const getTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = validated<TransactionParams>(res, "params");
  const transaction = await paymentService.getTransaction(id);
  res.status(200).json(successResponse(transaction));
};
