import { activeSessions, ActiveSession } from "../state/activeSession";
import { ClassModel } from "../db/class.repo";
import { Attendance } from "../db/attendance.repo.ts"
import { startAttendanceSchema } from "../zod/attendance.schema";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique session IDs

export async function startSession(classId: string, teacherId: string): Promise<ActiveSession> {
  const input = startAttendanceSchema.parse({ classId });

  // Check if there's already an ongoing session for this class
  if (activeSessions.has(input.classId)) {
    const classActiveSessions = activeSessions.get(input.classId);
    // Assuming only one ongoing session per class for now, find it.
    // In a more complex scenario, you might have multiple types of sessions.
    const ongoingSession = Array.from(classActiveSessions?.values() || []).find(s => s.status === 'ongoing');
    if (ongoingSession) {
      throw new Error(`An attendance session (ID: ${ongoingSession.sessionId}) is already active for class ID: ${input.classId}`);
    }
  }

  const foundClass = await ClassModel.findById(input.classId);
  if (!foundClass) {
    throw new Error("Class not found");
  }
  // Check if the teacher initiating the session is actually a teacher of the class
  if (!foundClass.teacherIds.includes(teacherId)) { // Assuming teacherIds is an array of strings
    throw new Error("Forbidden: Not a class Teacher");
  }

  const newSessionId = uuidv4(); // Generate a unique ID for the new session
  const newSession: ActiveSession = {
    sessionId: newSessionId,
    classId: input.classId,
    teacherId: teacherId,
    startedAt: new Date(), // Store as Date object
    status: 'ongoing',
    attendance: {},
  };

  // Initialize class's map if it doesn't exist
  if (!activeSessions.has(input.classId)) {
    activeSessions.set(input.classId, new Map<string, ActiveSession>());
  }
  // Store the new session
  activeSessions.get(input.classId)?.set(newSession.sessionId, newSession);

  return newSession;
}

// TODO: Implement markStudentAttendance, getTodayAttendanceSummary, getStudentAttendanceRecords, endSession
// These functions will also need to be updated to interact with the activeSessions Map.

export async function getMyAttendance(classId: string, studentId: string) {
  const attendanceOfStudent = await Attendance.findOne({ classId, studentId });
  if (!attendanceOfStudent) {
    return null;
  }
  return attendanceOfStudent;
}