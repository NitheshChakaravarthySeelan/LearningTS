import WebSocket from 'ws';

/**
 * The WebSocket gives user
  * send(data), close(code?, reason?), readyState, onmessage, onclose, onerror
*/
export interface AuthenticatedWebSocket extends WebSocket {
  user?: {
    userId: string,
    role: 'teacher' | 'student' | 'admin';
  };
}
