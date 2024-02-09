import pugRenderer, { composeCompiled, composeCompiledFile, composecompiledClient } from "./pugRender";

const pugOptions = {
  cyclePlugin: {
    // other plugins,
    compileFile: composeCompiledFile,
    compile: composeCompiled,
    compileClient: composecompiledClient,
    compileFileClient: pugRenderer("compileFileClient"),
  },
};

export default pugOptions;
