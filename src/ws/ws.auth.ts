import { type AuthenticatedWebSocket } from "../types/ws";
import { IncomingMessage } from 'http';
import { verifyToken } from "../lib/jwt";

export async function authenticateWebSocket(ws: AuthenticatedWebSocket, req: IncomingMessage): Promise<boolean> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('WebSocket unauthorized: Missing or malformed Authorization Header');
    ws.close(1008, "Unauthorized");
    return false;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = await verifyToken(token);
    ws.user = {
      userId: payload.userId,
      role: payload.role,
    };
    return true;
  } catch (err) {
    ws.close(1008, "Invalid Token");
    return false;
  }
}
