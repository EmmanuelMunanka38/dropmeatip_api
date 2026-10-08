import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export type ValidationSource = "body" | "query" | "params";

export const validate = (
  schema: ZodTypeAny,
  source: ValidationSource = "body",
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    if (source === "body") {
      req.body = result.data;
    }

    res.locals.validated = {
      ...res.locals.validated,
      [source]: result.data,
    };

    next();
  };
};

export const validated = <T>(
  res: Response,
  source: ValidationSource = "body",
): T => res.locals.validated?.[source] as T;
