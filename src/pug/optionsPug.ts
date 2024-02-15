import {
  composeCompiled,
  composecompiledClient,
  composeCompiledFile,
  composeCompiledFileClient,
  render,
  renderFile,
} from "./pugRender.ts";

const pugOptions = {
  cyclePlugin: {
    compileFile: composeCompiledFile,
    compile: composeCompiled,
    compileClient: composecompiledClient,
    compileFileClient: composeCompiledFileClient,
    render: render,
    renderFile: renderFile,
  },
};

export default pugOptions;
