import { runtime } from "vixeny";
import type { VServe } from "./serverType.ts";
import mainDeno from "./mainDeno.ts";
import mainBun from "./mainBun.ts";
import {injectable} from './injectable.ts'

const currentRT = runtime.name();

const serve = (opt: VServe) =>
  currentRT === "Bun" ? void mainBun(opt) : void mainDeno(opt) ;

export { injectable, serve };
