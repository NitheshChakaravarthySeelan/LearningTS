import { Elysia } from "elysia";
import { auth } from "../middlewares/auth";
import { teacherOnly } from "../middlewares/teacherOnly";
import { isClassOwner } from "../middlewares/ownership";
import { startSession, getMyAttendance } from "../services/attendance.service";
import { getClassById } from "../services/class.service";

const attendanceTeacherRoute = new Elysia()
  .use(teacherOnly)
  .use(isClassOwner)
  .post("/start", async ({ body, set, user }) => {
    const startService = await startSession(body.classId, user.userId);
    set.status = 200;
    return {
      success: true,
      data: startService
    };
  });

const attendanceStudentRoute = new Elysia()
  .get("/class/:id/my-attendance", async ({ set, user, params }) => {
    if (user.role !== 'student') {
      set.status = 403;
      throw new Error("Forbidden student access required");
    }
    const isStudentInClass = await getClassById(params.id, user.UserId, user.role);
    if (!isStudentInClass) {
      set.status = 403;
      throw new Error("Forbidden student must be in the class");
    }
    const myAttendance = await getMyAttendance(params.id, user.id);
    set.status = 200;
    return {
      success: true,
      data: myAttendance,
    };
  });

const attendanceRoute = new Elysia({ prefix: "/attendance" })
  .use(auth)
  .use(attendanceTeacherRoute)
  .use(attendanceStudentRoute)
