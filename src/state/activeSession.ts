export type AttendanceStatus = 'present' | 'absent';

export interface ActiveSession {
  classId: string;
  startedAt: string;
  attendance: {
    [studentId: string]: AttendanceStatus;
  };
}

export let activeSession: ActiveSession | null = null;
