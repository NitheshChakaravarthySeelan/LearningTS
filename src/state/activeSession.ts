export type AttendanceStatus = 'present' | 'absent';

export interface ActiveSession {
  sessionId: string;
  classId: string;
  teacherId: string;
  startedAt: Date;
  status: 'ongoing' | 'ended';
  attendance: {
    [studentId: string]: AttendanceStatus;
  };
}

// Key: classId (string)
// Value: Another Map where:
//   Key: sessionId (string)
//   Value: ActiveSession object
export const activeSessions = new Map<string, Map<string, ActiveSession>>();
