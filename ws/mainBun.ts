import { serve } from "bun";

let SERVER_TIME = Date.now() + 1000;

serve({
  fetch(req, server) {
    // Check if the request is an upgrade to WebSocket

    if (req.headers.get("upgrade") != "websocket") {
      //serve
      return new Response(null, { status: 501 });
    }
    server.upgrade(req)
    return 

  },
  websocket: {
    // Handler when a socket is opened
    open(ws) {
      console.log('hi')
      ws.send(SERVER_TIME.toString());
    },
    // Handler when a message is received
    message(ws, message) {
      ws.send(SERVER_TIME.toString());
    },
    // Handler when a socket is closed
    close(ws, code, reason) {
      //console.log(`WebSocket closed with code: ${code}, reason: ${reason}`);
    },
    // Optional handler for when the socket is ready to receive more data
    drain(ws) {
      console.log(`WebSocket is ready for more data`);
    },
    
    perMessageDeflate: true,
  },
  port: 8000, // You can specify the port here
});

console.log("WebSocket server is running on ws://localhost:8000");
