import { WebSocketServer, WebSocket } from 'ws';
import http from 'http'; // Import Node.js http module
import { IncomingMessage } from 'http';
import { authenticateWebSocket } from './ws.auth';
import { AuthenticatedWebSocket } from '../types/ws';
import { handleWebSocketMessage } from './ws.handlers';

// Initialize the WebSocket server on its own dedicated HTTP server
export function initializeWebSocketServer(wsPort: number): WebSocketServer {
  // Create a dedicated HTTP server for WebSockets
  const wsHttpServer = http.createServer();

  const wss = new WebSocketServer({
    server: wsHttpServer, // Attach the WebSocket server to its dedicated HTTP server
    path: '/ws',           // Specify the WebSocket path
  });

  wss.on('connection', async (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
    const isAuthenticated = await authenticateWebSocket(ws, req);
    if (!isAuthenticated) {
      return;
    }

    if (!ws.user) {
      console.error('Authenticated WebSocket connection without user data. Closing.');
      ws.close(1011, 'Internal Server Error: Missing user data');
      return;
    }

    console.log(`WebSocket connected, user: ${ws.user.userId} (${ws.user.role})`);

    ws.on('message', (message: WebSocket.RawData) => {
      handleWebSocketMessage(ws, message);
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket disconnected for user ${ws.user?.userId || 'unknown'}. Code: ${code}, Reason: ${reason.toString()}`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${ws.user?.userId || 'unknown'}:`, error);
    });
  });

  wsHttpServer.listen(wsPort, () => {
    console.log(`WebSocket server listening on ws://localhost:${wsPort}/ws`);
  });

  console.log('WebSocket server instance created and listening on dedicated port.');
  return wss;
}
