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
import * as ejsModule from "ejs";
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

export const staticServerPlugings = {
  pug: pugStaticServerPlugin,
  ejs: ejsStaticServerPlugin,
};
