import * as esbuild from "esbuild";
import * as React from "react";
import * as Dom from "react-dom/server";
type petitionType = (
  r: Request,
) =>
  | (Promise<{ [keys: string]: any } | null>)
  | ({ [keys: string]: any } | null);

type StaticServer = {
  default?: {
    [args: string]: any;
  };
  //petition?: petitionType;
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

const onProduction =
  (esm: typeof esbuild) =>
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (opt: StaticServer) =>
  (path: string) =>
    ((element: any) =>
    (component: any) =>
    (def: string | null) =>
    async (r: Request) =>
      def === null
        ? new Response(
          def = DomModule.renderToString(
            component = ReactModule.createElement(
              element = new Function(
                "React",
                "module",
                `${await renderComponentFromTSX(esm)(
                  path,
                )}; return module.exports;`,
              )(ReactModule, { exports: {} }).default,
              opt?.default,
            ),
          ),
          {
            headers: new Headers([
              ["content-type", "text/html"],
            ]),
          },
        )
        : new Response(
          def,
          {
            headers: new Headers([
              ["content-type", "text/html"],
            ]),
          },
        ))(null)(null)(null);

export const tsxStaticServer =
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (esm: typeof esbuild) =>
  (opt: StaticServer) => (
    {
      checker: (path: string) => path.endsWith(".tsx"),
      r: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) => ({
        type: "response",
        path: ob.relativeName.slice(0, -4),
        r: onProduction(esm)(DomModule)(ReactModule)(opt)(ob.path),
      } as const),
    }
  );
