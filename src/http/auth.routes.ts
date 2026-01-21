import { Elysia, t } from "elysia";
import { signup, login, getMe } from "../services/auth.service";

interface AuthStore {
  userId: string;
  role: "admin" | "teacher" | "student";
}

export const authRoutes = new Elysia<{ store: Partial<AuthStore>; }>({ prefix: "/auth" })

  .post(
    "/signup",
    async ({ body, set }) => {
      const user = await signup(body);

      set.status = 201;
      return {
        success: true,
        data: user,
      };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        role: t.Union([
          t.Literal("teacher"),
          t.Literal("student"),
          t.Literal("admin"),
        ]),
      }),
    }
  )

  .post(
    "/login",
    async ({ body }) => {
      const data = await login(body);
      return {
        success: true,
        data,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )

  .get("/me", async ({ store, set }) => {
    if (!store.userId) {
      set.status = 401;
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const user = await getMe(store.userId);
    return {
      success: true,
      data: user,
    };
  });
