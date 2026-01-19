import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { env } from "../config/env.ts";

const JWT_SECRET = env.JWT;

interface JwtPayload {
  userId: string,
  role: 'teacher' | 'admin' | 'student',
}

export function generateToken(payload: JwtPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h"
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return null;
    }
    if (err instanceof JsonWebTokenError) {
      return null;
    }
    throw err;
  }
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const decoded = await jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload; \
  } catch (err) {
    throw err;
  }
}
