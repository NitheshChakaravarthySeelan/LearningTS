import { Elysia, t } from "elysia";
import { teacherOnly } from "../middlewares/teacherOnly.ts";
import { auth } from "../middlewares/auth.ts";
import { createClass, addStudentToClass, getClassById } from "../services/class.service.ts";

const teacherRoutes = new Elysia()
  .use(teacherOnly)
  .post("/", async ({ body, set, user }) => {
    const createdClass = await createClass(body.className, user.userId);
    set.status = 201;
    return {
      success: true,
      data: createdClass,
    };
  },
    {
      body: t.Object({
        className: t.String({ minLength: 1 })
      })
    }
  )
  .post("/:id/add-student", async ({ body, params, set, user }) => {
    const classId = params.id;
    const data = await addStudentToClass(classId, body.studentId, user.userId);
    set.status = 200;
    return {
      success: true,
      data: data,
    };
  },
    {
      body: t.Object({
        studentId: t.String({ minLength: 1 })
      })
    }
  );

const authenticatedRoutes = new Elysia()
  .get("/:id", async ({ params, user, set }) => {
    const classId = params.id;
    const classInDB = await getClassById(classId, user.userId, user.role);
    set.status = 200;
    return {
      success: true,
      data: classInDB
    };
  });

export const classRoutes = new Elysia({ prefix: "/class" })
  .use(auth)
  .use(teacherRoutes)
  .use(authenticatedRoutes);

