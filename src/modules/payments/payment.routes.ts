import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import * as paymentController from "./payment.controller.js";
import {
  initiatePaymentSchema,
  transactionParamsSchema,
  webhookSchema,
} from "./payment.schema.js";

const router = Router();

router.post(
  "/initiate",
  validate(initiatePaymentSchema),
  paymentController.initiatePayment,
);

router.post(
  "/webhook",
  paymentController.verifyWebhookSecret,
  validate(webhookSchema),
  paymentController.handleWebhook,
);

router.get(
  "/transaction/:id",
  validate(transactionParamsSchema, "params"),
  paymentController.getTransaction,
);

export default router;
