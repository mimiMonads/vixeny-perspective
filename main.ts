import {
  composeCompiled,
  composecompiledClient,
  composeCompiledClientWithDependenciesTracked,
  composeCompiledFile,
  composeCompiledFileClient,
  render,
  renderFile,
} from "./src/pug/pugRender.ts";
import {
  ejsComposeCompiled,
  ejsComposeRenderFile,
  ejsRender,
} from "./src/ejs/ejsRender.ts";

import { pugStaticServerPlugin } from "./src/pug/staticServer.ts";
import { ejsStaticServerPlugin } from "./src/ejs/staticServer.ts";
import { remarkStaticServer } from "./src/remark/staticServer.ts";
import { sassStaticServer } from "./src/sass/staticServer.ts";
import { postcssStaticServer } from "./src/postcss/staticServer.ts";
import { typescriptStaticServer } from "./src/typescript/staticServe.ts";
import { jsxStaticServer } from "./src/jsx/staticServe.ts";
// @deno-types="npm:@types/ejs@^3.1.5"
import * as ejsModule from "ejs";
// @deno-types="npm:@types/pug@^2.0.10"
import * as pugModule from "pug";

export const pug = (pug: typeof pugModule) => ({
  compileFile: composeCompiledFile(pug.compileFile),
  compile: composeCompiled(pug.compile),
  compileClient: composecompiledClient(pug.compileClient),
  compileFileClient: composeCompiledFileClient(pug.compileFileClient),
  render: render(pug.render),
  compileClientWithDependenciesTracked:
    composeCompiledClientWithDependenciesTracked(
      pug.compileClientWithDependenciesTracked,
    ),
  renderFile: renderFile(pug.renderFile),
});

export const ejs = (ejs: typeof ejsModule) => ({
  compile: ejsComposeCompiled(ejs.compile),
  render: ejsRender(ejs.render),
  renderFile: ejsComposeRenderFile(ejs.renderFile),
});

export {
  ejsStaticServerPlugin,
  jsxStaticServer,
  postcssStaticServer,
  pugStaticServerPlugin,
  remarkStaticServer,
  sassStaticServer,
  typescriptStaticServer,
};
