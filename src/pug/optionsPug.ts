import pugRenderer from "./pugRender";

const pugOptions = {
  cyclePlugin: {
    // other plugins,
    compileFile: pugRenderer("compileFile"),
    compile: pugRenderer("compile"),
    compileClient: pugRenderer("compileClient"),
    compileFileClient: pugRenderer("compileFileClient")
  },
};

export default pugOptions;
