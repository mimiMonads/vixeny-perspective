import type * as Vixeny from "vixeny";

export type pluginType = {
  type: typeof Vixeny.plugins.type;
  [key: string]: any;
};
