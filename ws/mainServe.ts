import { runtime } from "vixeny";
import { VServe } from "./serverType";
import mainDeno from "./mainDeno.ts";
import mainBun from "./mainBun.ts";
import injectHtml from "vixeny/src/composer/injectHtml.ts";

const currentRT = runtime.name();

const serve = (opt: VServe) =>
  currentRT === "Deno" ? void mainDeno(opt) : void mainBun(opt);

export { injectHtml, serve };
