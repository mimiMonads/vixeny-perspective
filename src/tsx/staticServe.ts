import * as esbuild from "esbuild";
import React from "react";
import Dom from "react-dom/server";
type petitionType = (r: Request) => (Promise<{[keys: string]:any} | null>) | ({[keys: string]:any} | null)

type StaticServer = {
  default?: {
    [args: string]: any
  },
  petition?:petitionType
};

const   renderComponentFromTSX  =  (esm: typeof esbuild) => async (path:string) =>
     new TextDecoder("utf-8").decode(  (  esm.buildSync({
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
 
//@ts-ignore
const element = React.createElement(Component);
console.log( element )
console.log(  Dom.renderToString(element))

const onProduction= (esm: typeof esbuild) =>   (DomModule: typeof Dom) =>
(ReactModule: typeof React) =>  (opt: StaticServer) =>  (path:string) =>
      (
        component => (
          def => (r:Request) =>
        new Response(def,{
            headers: new Headers([
              ["content-type", "text/html"], 
            ]),
          })          
        )(
          //@ts-ignore
          DomModule.renderToString(opt?.default ? React.createElement(component,opt.default) : React.createElement(component))
        )
      )(
        (new Function('React', 'module', `${
          renderComponentFromTSX(esm)(path)
        }; return module.exports;`)(ReactModule)({ exports: {} })).default
      )
;


const onPetitionProduction= (esm: typeof esbuild) =>   (DomModule: typeof Dom) =>
(ReactModule: typeof React) =>  (opt?: StaticServer) => (path:string) => async (petition: petitionType) =>
      (
        component => (
          def => (r:Request) =>
            petition.constructor.name === 'AsyncFunction'
              ? async (r:Request) => (
                resolved => new Response(
                  resolved === null
                    ? def
                    //@ts-ignore
                    : DomModule.renderToString(React.createElement(component,resolved))
                  ,{
                  headers: new Headers([
                    ["content-type", "text/html"], 
                  ]),
                })  
              )(
                await (petition(r))
              )
              : (r:Request) => (
                resolved => new Response(
                  resolved === null
                    ? def
                    //@ts-ignore
                    : DomModule.renderToString(ReactModule.createElement(component,resolved))
                  ,{
                  headers: new Headers([
                    ["content-type", "text/html"], 
                  ]),
                })  
              )(
                (petition(r))
              )      
        )(
          //@ts-ignore
          DomModule.renderToString(opt?.default ? ReactModule.createElement(component,opt.default) : ReactModule.createElement(component))
        )
      )(
        (new Function('React', 'module', `${
          renderComponentFromTSX(esm)(path)
        }; return module.exports;`)(ReactModule)({ exports: {} })).default
      )
;

export const tsxStaticServer =
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (esm: typeof esbuild) => 
  (opt: StaticServer) => (
    {
      checker: (path: string) => path.endsWith(".tsx"),
      r: async (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) => ({
        type: "response",
        path: ob.relativeName.slice(0, -4),
        r: opt && opt.petition 
          ? onPetitionProduction(esm)(DomModule)(ReactModule)(opt)(ob.path)(opt.petition)
          : onProduction(esm)(DomModule)(ReactModule)(opt)(ob.path)
          ,
      } as const),
    }
  );