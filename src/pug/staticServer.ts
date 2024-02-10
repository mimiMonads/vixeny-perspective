
import {  compileFile } from "pug";

type StaticServer = {
    preserveExtension?: boolean;
    default?: { [key: string]: any };
}


export const pugStaticServerPlugin = (option?:StaticServer) => ({
    checker: (path:string) => path.includes('.pug'),
    r: (s:string) => (def => file => ({
        type: "response",
        path: option && option.preserveExtension ? s.slice(0,-4) : s,
        r: () => new Response(file(def))
    }))(
        option && option.default ? option.default : null
    )(
        compileFile(s) 
    )
});