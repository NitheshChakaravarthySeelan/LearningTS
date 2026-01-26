import { Elysia } from "elysia";
import { verifyToken } from "../lib/jwt.ts"

export const auth = new Elysia()
  .derive(async ({ headers, set }) => {
    const authorization = headers.authorization;

    if (!authorization) {
      set.status = 401;
      return;
    }

    const [schema, token] = authorization.split(" ");

    if (schema !== "Bearer" || !token) {
      set.status = 401;
      return;
    }

    try {
      const user = await verifyToken(token);
      return { user };
    } catch {
      set.status = 401;
      return;
    }
  })
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return "Unauthorized";
    }
  });
