import { TransformOptions } from "esbuild";
import path from "node:path";
import * as Dom from "react-dom/server";
import * as React from "react";
const __dirname = import.meta.dirname;

type options = Omit<TransformOptions, "entryPoints">;

type StaticServer = {};

export const jsxStaticServer =
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (esOptions?: StaticServer) => (
    {
      checker: (path: string) => path.endsWith(".tsx") || path.endsWith(".jsx"),
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
              v = DomModule.renderToString(
                ReactModule.createElement(
                  (await import(
                    path.join(
                      __dirname as string,
                    ...ob.path.slice(ob.path.indexOf("/"), ob.path.lastIndexOf("/")).split('/').filter( x => x !== '').map( _ => ".."),
                    ob.path,
                  ))).default,
                ),
              ),
              {
                headers: new Headers([
                  ["content-type", "text/html"], // Corrected content-type for HTML
                ]),
              },
            ))(""),
      } as const),
    }
  );
