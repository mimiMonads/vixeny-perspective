import {
  composeCompiled,
  composecompiledClient,
  composeCompiledFile,
  composeCompiledFileClient,
  render,
  renderFile,
} from "./src/pug/pugRender";

export const pug = {
  compileFile: composeCompiledFile,
  compile: composeCompiled,
  compileClient: composecompiledClient,
  compileFileClient: composeCompiledFileClient,
  render: render,
  renderFile: renderFile,
};
