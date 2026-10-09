import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import creatorRoutes from "./modules/creators/creator.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import walletRoutes from "./modules/wallet/wallet.routes.js";
import { HttpError } from "./utils/http-error.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { message: "Drop Me a Tip API is up and running" },
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "ok", uptime: process.uptime() },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/creators", creatorRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/wallet", walletRoutes);

app.use((req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;
