import {
  ejsStaticServerPlugin,
  ejsToPetition,
} from "./src/ejs/staticServer.ts";
import {
  pugStaticServerPlugin,
  pugToPetition,
} from "./src/pug/staticServer.ts";
import { remarkStaticServer } from "./src/remark/staticServer.ts";
import { sassStaticServer } from "./src/sass/staticServer.ts";
import { postcssStaticServer } from "./src/postcss/staticServer.ts";
import { typescriptStaticServer } from "./src/typescript/staticServe.ts";
import { tsxStaticServerPlugin, tsxToPetition } from "./src/tsx/staticServe.ts";
import { jsxStaticServerPlugin, jsxToPetition } from "./src/jsx/staticServe.ts";
import { injectable, serve } from "./ws/mainServe.ts";

export {
  // Ejs
  ejsStaticServerPlugin,
  ejsToPetition,
  injectable,
  jsxStaticServerPlugin,
  // JSX
  jsxToPetition,
  // PostCCS
  postcssStaticServer,
  // Pug
  pugStaticServerPlugin,
  pugToPetition,
  // Remark < idk how to call it xd >
  remarkStaticServer,
  // Sass
  sassStaticServer,
  // For enviroment
  serve,
  // TSX
  tsxStaticServerPlugin,
  tsxToPetition,
  // Esbuild
  // TODO: add a better name for this
  typescriptStaticServer,
};
