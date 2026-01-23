import { WebSocketServer } from "ws";

let wss;

export function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("client connected");

    ws.on("close", () => {
      console.log("client disconnected");
    });
  });

  return wss;
}

export function broadcast(event) {
  if (!wss) return;

  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}
