import app from "./app.js";
import http from "http";
import { initWebSocket } from "./websocket.js";

const PORT = 4000;

const server = http.createServer(app);
export const wss = initWebSocket(server);

server.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
});
