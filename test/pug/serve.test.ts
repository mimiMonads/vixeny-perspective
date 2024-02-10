import { vixeny } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import { pugStaticServerPlugin } from "../../src/pug/staticServer.ts";


const serve = vixeny()([{
    type: 'fileServer',
    name: './public',
    path: './public',
    mime: false,
    plugins: pugStaticServerPlugin()
}])
