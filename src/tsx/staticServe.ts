import esbuild from "esbuild";
import React from "react";
import * as Dom from "react-dom/server";
type petitionType = (r: Request) => pugModule.LocalsObject | null

type StaticServer = {
  default?: {
    [args: string]: any
  },
  petition?:petitionType
};

const   renderComponentFromTSX  = (esm: typeof esbuild) => (path:string) =>
     new TextDecoder("utf-8").decode(( esm.buildSync({
        entryPoints: [path],
        bundle: true,
        write: false,
        platform: 'browser',
        format: 'cjs',
        loader: { '.tsx': 'tsx', '.jsx': 'jsx' },
      })).outputFiles[0].contents);


const transpiledCode =  renderComponentFromTSX(esbuild)("./public/tsx/main.tsx")

const module = { exports: {} };

// Execute the transpiled code, which expects React and module to be defined
const executeTranspiledCode = new Function('React', 'module', `${transpiledCode}; return module.exports;`);
const Component = executeTranspiledCode(React, module).default;
 

const element = React.createElement(Component);
console.log( element )
console.log(  Dom.renderToString(element))

const onLazy = (esm: typeof esbuild) =>   (DomModule: typeof Dom) =>
(ReactModule: typeof React) =>  (opt: StaticServer) => (path:string) =>
      (
        component => (
          def => (r:Request) =>
          
        new Response(def,{
            headers: new Headers([
              ["content-type", "text/html"], 
            ]),
          })

          
        )(
          DomModule.renderToString(opt?.default ? React.createElement(component,opt.default) : React.createElement(component))
        )
      )(
        (new Function('React', 'module', `${
          renderComponentFromTSX(esm)(path)
        }; return module.exports;`)(ReactModule)({ exports: {} })).default
      )
;

export const jsxStaticServer =
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (opt: StaticServer) => (
    {
      checker: (path: string) => path.endsWith(".jsx"),
      r: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) => ({
        type: "response",
        path: ob.relativeName.slice(0, -4),
        r: ((v) => async () =>
          v
            ? new Response(v, {
              headers: new Headers([
                ["content-type", "text/html"], // Corrected content-type for HTML
              ]),
            })
            : new Response(
              v = ''
              ,
              {
                headers: new Headers([
                  ["content-type", "text/html"], // Corrected content-type for HTML
                ]),
              },
            ))(""),
      } as const),
    }
  );