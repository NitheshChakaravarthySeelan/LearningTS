// src/ws/ws.handlers.ts
import { AuthenticatedWebSocket } from '../types/ws';
import WebSocket from 'ws';
import * as attendanceService from '../services/attendance.service'; // Assuming these services exist
import * as classService from '../services/class.service';       // Assuming these services exist
import { activeSessions } from '../state/activeSession';          // Assuming activeSession state exists

// Define a basic interface for incoming WebSocket messages
interface WebSocketMessage {
  type: string;
  payload?: any;
}

export async function handleWebSocketMessage(ws: AuthenticatedWebSocket, message: WebSocket.RawData): Promise<void> {
  if (!ws.user) {
    console.error('Unauthorized WebSocket connection tried to send message.');
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Unauthorized access.' }));
    ws.close(1008, 'Unauthorized');
    return;
  }

  let parsedMessage: WebSocketMessage;
  try {
    parsedMessage = JSON.parse(message.toString());
  } catch (error) {
    console.error(`Invalid JSON message from ${ws.user.userId}: ${message.toString()}`);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON format.' }));
    return;
  }

  console.log(`User ${ws.user.userId} sent message type: ${parsedMessage.type}`);

  try {
    switch (parsedMessage.type) {
      case 'ATTENDANCE_MARKED':
        // Payload should contain sessionId and studentId/attendance details
        // Example: { type: 'ATTENDANCE_MARKED', payload: { sessionId: '...', studentId: '...' } }
        if (ws.user.role !== 'student') {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Only students can mark attendance via this route.' }));
          return;
        }

        const { sessionId, classId } = parsedMessage.payload; // Assuming these are sent by the client

        if (!sessionId || !classId) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Missing sessionId or classId for ATTENDANCE_MARKED.' }));
          return;
        }
        
        // Find the active session for this class
        const session = activeSessions.get(classId)?.get(sessionId);

        if (!session || session.status !== 'ongoing') {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'No active or ongoing session found for this class.' }));
          return;
        }

        // Mark attendance using the service
        await attendanceService.markStudentAttendance(sessionId, ws.user.userId, classId);

        ws.send(JSON.stringify({ type: 'ATTENDANCE_ACK', message: 'Attendance marked successfully.' }));
        // Potentially notify the teacher or all students in the session
        // For simplicity, this example only sends back to the student.
        break;

      case 'TODAY_SUMMARY':
        // Payload might contain classId if teacher is asking for a specific class summary
        // Example: { type: 'TODAY_SUMMARY', payload: { classId: '...' } }
        if (ws.user.role !== 'teacher') {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Only teachers can request today\'s summary.' }));
          return;
        }
        const { classId: summaryClassId } = parsedMessage.payload || {}; // Optional classId

        const todaySummary = await attendanceService.getTodayAttendanceSummary(summaryClassId, ws.user.userId);
        ws.send(JSON.stringify({ type: 'TODAY_SUMMARY_RESPONSE', payload: todaySummary }));
        break;

      case 'MY_ATTENDANCE':
        // Payload might contain classId for specific attendance records
        // Example: { type: 'MY_ATTENDANCE', payload: { classId: '...' } }
        if (ws.user.role !== 'student') {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Only students can request their attendance.' }));
          return;
        }
        const { classId: myAttendanceClassId } = parsedMessage.payload || {}; // Optional classId

        const myAttendance = await attendanceService.getStudentAttendanceRecords(ws.user.userId, myAttendanceClassId);
        ws.send(JSON.stringify({ type: 'MY_ATTENDANCE_RESPONSE', payload: myAttendance }));
        break;

      case 'DONE':
        // Payload might contain sessionId and classId if a teacher is ending a session
        // Example: { type: 'DONE', payload: { sessionId: '...', classId: '...' } }
        if (ws.user.role !== 'teacher') {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Only teachers can end sessions.' }));
          return;
        }
        const { sessionId: endSessionId, classId: endClassId } = parsedMessage.payload;

        if (!endSessionId || !endClassId) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Missing sessionId or classId for DONE.' }));
          return;
        }

        // End the session
        const endedSession = await attendanceService.endSession(endSessionId, endClassId, ws.user.userId);
        if (endedSession) {
          ws.send(JSON.stringify({ type: 'SESSION_ENDED', message: 'Session ended successfully.', payload: endedSession }));
          // Notify all connected students in that session that the session has ended
          // This requires iterating through connected clients or using a pub-sub mechanism
        } else {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Failed to end session or session not found.' }));
        }
        break;

      default:
        console.warn(`Unknown message type received from ${ws.user.userId}: ${parsedMessage.type}`);
        ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown message type: ${parsedMessage.type}` }));
        break;
    }
  } catch (error: any) {
    console.error(`Error handling WebSocket message for ${ws.user.userId}, type ${parsedMessage.type}:`, error);
    ws.send(JSON.stringify({ type: 'ERROR', message: error.message || 'An internal server error occurred.' }));
  }
}
