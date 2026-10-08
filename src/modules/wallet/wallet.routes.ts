import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as walletController from "./wallet.controller.js";
import { ledgerQuerySchema, withdrawSchema } from "./wallet.schema.js";

const router = Router();

router.get("/balance", authenticate, walletController.getBalance);

router.get(
  "/ledger",
  authenticate,
  validate(ledgerQuerySchema, "query"),
  walletController.getLedger,
);

router.post(
  "/withdraw",
  authenticate,
  validate(withdrawSchema),
  walletController.withdraw,
);

export default router;
