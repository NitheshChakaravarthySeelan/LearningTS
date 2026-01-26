import { Elysia } from "elysia";
import { ClassModel } from "../db/class.repo";

export const isClassOwner = new Elysia()
  .onBeforeHandle(async ({ set, params }) => {
    const classId = params.classId;
    const filledClass = ClassModel.findById(classId);
    if (!filledClass) {
      set.status = 401;
      return {
        success: false,
        error: "Can't find the given class"
      }
    }

    if (user.userId === filledClass.teacherIds.toString()) {
      set.status = 403;
      return {
        success: false,
        error: "Forbidden, not class teacher",
      }
    }
  });
