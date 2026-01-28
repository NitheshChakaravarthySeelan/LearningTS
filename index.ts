// index.ts
import { app } from './src/server.ts'; // Import the Elysia app
import { initializeWebSocketServer } from './src/ws/ws.server.ts'; // Import the WS server initializer

async function main() {
  const HTTP_PORT = process.env.PORT || 8000;
  const WS_PORT = process.env.WS_PORT || 8001; // Dedicated port for WebSockets

  // Start the Elysia HTTP server
  app.listen(HTTP_PORT, () => {
    console.log(`Elysia HTTP server running on port ${HTTP_PORT}`);
    console.log(`HTTP routes accessible at http://localhost:${HTTP_PORT}`);
  });

  // Initialize WebSocket server on its own dedicated port
  initializeWebSocketServer(WS_PORT);
}

main().catch((err) => {
  console.error("Fatal startup error: ", err);
  process.exit(1);
});