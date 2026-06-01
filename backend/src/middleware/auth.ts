import type { NextFunction, Request, Response } from "express";
import { verifySession } from "../services/auth.service";
import { HttpError } from "../utils/httpError";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Bearer 토큰이 필요합니다.");
    }

    const session = await verifySession(header.slice("Bearer ".length));
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    };
    req.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
}
