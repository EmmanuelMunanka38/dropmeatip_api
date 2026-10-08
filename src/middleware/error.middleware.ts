import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";
import { errorResponse } from "../utils/api-response.js";
import { HttpError } from "../utils/http-error.js";

const mapPrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
): { statusCode: number; message: string } => {
  switch (error.code) {
    case "P2002":
      return {
        statusCode: 409,
        message: "A record with the same value already exists",
      };
    case "P2025":
      return { statusCode: 404, message: "Requested record not found" };
    case "P2003":
      return {
        statusCode: 409,
        message: "Operation conflicts with existing related records",
      };
    default:
      return { statusCode: 500, message: "Database operation failed" };
  }
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues.map((issue) => ({
      field: issue.path.join(".") || "(root)",
      message: issue.message,
    }));
  } else if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(err);
    statusCode = mapped.statusCode;
    message = mapped.message;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    message = "Database connection error";
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON payload";
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode === 500) {
    console.error("Unhandled error:", err);
  }

  const stack =
    env.NODE_ENV === "development" && err instanceof Error ? err.stack : undefined;

  res.status(statusCode).json(errorResponse(message, errors, stack));
};
