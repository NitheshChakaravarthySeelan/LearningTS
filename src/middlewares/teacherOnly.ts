import { Elysia } from "elysia";

export const teacherOnly = new Elysia()
  .onBeforeHandle(async ({ user, set }) => {
    if (user.role !== "teacher") {
      set.status = 401;
      return "Forbidden";
    }
  });
