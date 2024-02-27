import { TransformOptions } from "esbuild";
import path from "node:path";
import * as Dom from "react-dom/server";
import * as React from "https://esm.run/react";

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
                  (await import(path.join(
                    //@ts-ignore
                    typeof Deno !== "undefined" ? Deno.cwd() : process.cwd(),
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