import * as esbuild from "esbuild";
import * as React from "react";
import * as Dom from "react-dom/server";
import { plugins , petitions} from "vixeny";


type Petition = ReturnType<ReturnType<typeof petitions.common>>;



  type StaticServer = {
    preserveExtension?: boolean;
    default?: Record<string, unknown>;
    thisGlobalOptions?: ReturnType<typeof plugins.globalOptions>;
    globalF?: Record<string, unknown> | null
    f?: Petition;
  };

const renderComponentFromTSX = (esm: typeof esbuild) => async (path: string) =>
  new TextDecoder("utf-8").decode(
    (await esm.build({
      entryPoints: [path],
      bundle: true,
      write: false,
      platform: "browser",
      format: "cjs",
      loader: { ".tsx": "tsx", ".jsx": "jsx" },
    })).outputFiles[0].contents,
  );


const rendering = (esm: typeof esbuild) =>
   (ReactModule: typeof React) => async (path:string) =>  new Function(
  "React",
  "module",
  `${await renderComponentFromTSX(esm)(
    path,
  )}; return module.exports;`,
)(ReactModule, { exports: {} }).default ;

const onProduction =
  (esm: typeof esbuild) =>
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (opt: StaticServer) =>
  (path: string) =>
    ((element: any) =>
    (component: any) =>
    (def: string | null) =>
    async (headers: Record<string, string>) =>
      def === null
        ? new Response(
          def = DomModule.renderToString(
            component = ReactModule.createElement(
              element = await rendering(esm)(ReactModule)(path)
            ),
          ),
          {
            headers: headers
          },
        )
        : new Response(
          def,
          {
            headers: headers,
          },
        ))(null)(null)(null);

export const tsxStaticServer =
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (esm: typeof esbuild) =>
  (opt: StaticServer) => plugins.staticFilePlugin(
    {
      type: 'request',
      checker: (path: string) => path.endsWith(".tsx"),
      f: (ob) => petitions.custom(opt?.thisGlobalOptions)
      ({
        path: ob.relativeName.slice(0, -4),
            // Headings
            headings: {
              headers: ".html",
            },
            // Only
            options: {
              only: ["headers"],
            },
        f: (fun => ({ headers } ) => fun(headers))(
          onProduction(esm)(DomModule)(ReactModule)(opt)(ob.path)
        ),
      }),
    }
  );
