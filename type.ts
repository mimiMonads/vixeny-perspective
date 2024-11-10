import type * as Vixeny from "vixeny";

export type plugingType = {
    type: typeof Vixeny.plugins.type;
    [key: string]: any;
}