import { activeSession, ActiveSession } from "../state/activeSession";
import { ClassModel } from "../db/class.repo";
import { Attendance } from "../db/attendance.repo.ts"
import { startAttendanceSchema } from "../zod/attendance.schema";

export async function startSession(classId: string, teacherId: string): Promise<ActiveSession> {
  const input = startAttendanceSchema.parse({ classId });
  if (activeSession) {
    throw new Error(`An Attendance session is already active for classID: ${activeSession.classId}`)
  }
  const foundClass = await ClassModel.findById(input.classId);
  if (!foundClass) {
    throw new Error("Class not found");
  }
  if (foundClass.teacherIds.toString() !== teacherId) {
    throw new Error("Forbidden not class Teacher");
  }

  const session = {
    classId: input.classId,
    startedAt: new Date().toISOString(),
    attendance: {},
  };
  activeSession = session;
  return session;
}

export async function getMyAttendance(classId: string, studentId: string) {
  const attendanceOfStudent = await Attendance.findOne({ classId, studentId });
  if (!attendanceOfStudent) {
    return null;
  }
  return attendanceOfStudent;
}
