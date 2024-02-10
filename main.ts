import {
  composeCompiled,
  composecompiledClient,
  composeCompiledFile,
  composeCompiledFileClient,
  render,
  renderFile,
} from "./src/pug/pugRender";
import {
  pugStaticServerPlugin
} from './src/pug/staticServer'

export const pug = {
  compileFile: composeCompiledFile,
  compile: composeCompiled,
  compileClient: composecompiledClient,
  compileFileClient: composeCompiledFileClient,
  render: render,
  renderFile: renderFile,
};

export const staticServerPlugings = {
  pug: pugStaticServerPlugin
}