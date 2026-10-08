import type { AuthUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }

    interface Locals {
      validated?: Partial<Record<"body" | "query" | "params", unknown>>;
    }
  }
}

export {};
