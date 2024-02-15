import { pug as pugModule } from "../../main.ts";
import pug from "pug";
const fromPug = pugModule(pug);
const pugOptions = {
  cyclePlugin: {
    ...fromPug,
  },
};

export default pugOptions;
