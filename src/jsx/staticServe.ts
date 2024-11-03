import type { TransformOptions } from "esbuild";
import path from "node:path";
import type * as Dom from "react-dom/server";
import type * as React from "react";
import type * as Vixeny from "vixeny";

type options = Omit<TransformOptions, "entryPoints">;

type StaticServer = {
  root: string;
};

// TODO: Fix this shit please

export const jsxStaticServer = (args: {
  Dom: typeof Dom;
  React: typeof React;
  opt: StaticServer;
  petitions: typeof Vixeny.petitions;
  plugins: typeof Vixeny.plugins;
}) => {
  const { Dom, React, opt, petitions, plugins } = args;

  return plugins.staticFilePlugin({
    checker: (ctx) => ctx.path.endsWith(".jsx"),
    p: (ob) =>
      petitions.response()(
        {
          path: ob.relativeName.slice(0, -4),
          r: ((v) => async () =>
            v
              ? new Response(v, {
                headers: new Headers([
                  ["content-type", "text/html"],
                  ["Access-Control-Allow-Origin", "*"], // Corrected content-type for HTML
                ]),
              })
              : new Response(
                v = Dom.renderToString(
                  React.createElement(
                    (await import(path.join(
                      //@ts-ignore
                      opt.root,
                      ob.path,
                    ))).default,
                  ),
                ),
                {
                  headers: new Headers([
                    ["content-type", "text/html"],
                    ["Access-Control-Allow-Origin", "*"], // Corrected content-type for HTML
                  ]),
                },
              ))(""),
        } as const,
      ),
  });
};
