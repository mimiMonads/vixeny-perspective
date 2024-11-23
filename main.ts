import { pugStaticServerPlugin } from "./src/pug/staticServer.ts";
import { ejsStaticServerPlugin } from "./src/ejs/staticServer.ts";
import { remarkStaticServer } from "./src/remark/staticServer.ts";
import { sassStaticServer } from "./src/sass/staticServer.ts";
import { postcssStaticServer } from "./src/postcss/staticServer.ts";
import { typescriptStaticServer } from "./src/typescript/staticServe.ts";
import { tsxStaticServer } from "./src/tsx/staticServe.ts";
import { jsxStaticServerPlugin } from "./src/jsx/staticServe.ts";
import { injectable, serve } from "./ws/mainServe.ts";

export {
  ejsStaticServerPlugin,
  injectable,
  jsxStaticServerPlugin,
  postcssStaticServer,
  pugStaticServerPlugin,
  remarkStaticServer,
  sassStaticServer,
  serve,
  tsxStaticServer,
  typescriptStaticServer,
};
