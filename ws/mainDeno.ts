import type { VServe } from "./serverType.ts";

// @ts-ignore-start

let SERVER_TIME = Date.now() + 1000;

export default (inf: VServe) =>
  inf.liveReolading === true
    ? void Deno.serve({
      port: inf.port ?? 8000,
      hostname: inf.hostname ?? "localhost",
    }, (req) => {
      if (req.headers.get("upgrade") != "websocket") {
        return inf.handler(req);
      }

      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.addEventListener("open", (event) => {
        socket.send(SERVER_TIME);
      });

      socket.addEventListener("message", (event) => {
        socket.send(SERVER_TIME);
      });

      return response;
    })
    : void Deno.serve({
      port: inf.port ?? 8000,
      hostname: inf.hostname ?? "localhost",
    }, inf.handler);

// @ts-ignore-end
