import type { VServe } from "./serverType.ts";

let SERVER_TIME = Date.now() + 1000;

export default (inf: VServe): void =>
  inf.liveReolading === true
//@ts-check
    ? void Bun.serve({
      fetch: (req, server) => {
        // Check if the request is an upgrade to WebSocket

        if (req.headers.get("upgrade") != "websocket") {
          //serve
          return inf.handler(req);
        }
        server.upgrade(req);
        return;
      },
      websocket: {
        open(ws) {
          ws.send(SERVER_TIME.toString());
        },

        message(ws, message) {
          ws.send(SERVER_TIME.toString());
        },

        close(ws, code, reason) {
        },

        drain(ws) {
          console.log(`WebSocket is ready for more data`);
        },

        perMessageDeflate: true,
      },
      port: inf.port ?? 8000,
      hostname: inf.hostname ?? "localhost",
    })
    //@ts-check
    : void Bun.serve({
      fetch: inf.handler,
      port: inf.port ?? 8000,
      hostname: inf.hostname ?? "localhost",
    });
