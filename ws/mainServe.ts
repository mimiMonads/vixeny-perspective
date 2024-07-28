import { runtime } from "vixeny";
import type { VServe } from "./serverType.ts";
import mainDeno from "./mainDeno.ts";
import mainBun from "./mainBun.ts";
import { injectable } from "./injectable.ts";

const currentRT = runtime.name();

const serve = (opt: VServe) =>
  currentRT === "Bun"
    ? (() => (
      mainBun(opt),
        void console.log(
          `Listening on http://${opt.hostname ?? "localhost"}:${
            opt.port ?? 8000
          }/`,
        )
    ))()
    : void mainDeno(opt);

export { injectable, serve };
