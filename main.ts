import {
  composeCompiled,
  composecompiledClient,
  composeCompiledClientWithDependenciesTracked,
  composeCompiledFile,
  composeCompiledFileClient,
  render,
  renderFile,
} from "./src/pug/pugRender.ts";
import { pugStaticServerPlugin } from "./src/pug/staticServer.ts";
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

export const staticServerPlugings = (pug: typeof pugModule) => ({
  pug: pugStaticServerPlugin(pug.compileFile),
});
