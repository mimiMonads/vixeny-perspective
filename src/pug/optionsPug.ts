import pugRenderer from "./pugRender";

const pugOptions = {
  cyclePlugin: {
    // other plugins,
    compileFile: pugRenderer('compileFile'),
    compile: pugRenderer('compile'),
  },
};

export default pugOptions;
