import * as ejsModule from "ejs";

import { ejs } from "../../main.ts";

const fromEjs = ejs(ejsModule);

export const ejsOptions = {
  cyclePlugin: {
    ...fromEjs,
  },
};
