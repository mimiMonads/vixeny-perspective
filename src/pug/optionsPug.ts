import pugRenderer from "./pugRender";

const pugOptions = {
  cyclePlugin: {
    // other plugins,
    compileFile: pugRenderer('compileFile'),
  },
};

export default pugOptions;
