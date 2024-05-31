import { pug as pugModule } from "../../main.ts";
import pug from "pug";
import { plugins } from "vixeny";
const fromPug = pugModule(pug);

const pugOptions = {
  cyclePlugin: {
    ...fromPug,
  },
};

export default pugOptions;
