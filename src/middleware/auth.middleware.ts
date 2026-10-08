import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db.js";
import type { AuthUser } from "../types/auth.js";
import { HttpError } from "../utils/http-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw HttpError.unauthorized("Authentication required");
    }

    const token = authHeader.slice("Bearer ".length).trim();

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw HttpError.unauthorized("Invalid or expired access token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, username: true, fullName: true },
    });

    if (!user) {
      throw HttpError.unauthorized("User account no longer exists");
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    };

    req.user = authUser;
    next();
  } catch (error) {
    next(error);
  }
};
