import { Elysia } from "elysia";
import { teacherOnly } from "../middlewares/teacherOnly.ts";
import { auth } from "../middlewares/auth.ts";
import { getAllStudents } from "../services/class.service";

const studentRouter = new Elysia({ prefix: "/students" }
  .use(auth)
  .use(teacherOnly)
  .get("", async (set) => {
    const students = getAllStudents();
    set.status = 200;
    return {
      success: true,
      data: students
    };
  })
);
