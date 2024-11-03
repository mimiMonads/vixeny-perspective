import { type PluginTuple, unified } from "unified";
import { readFileSync } from "node:fs";
import type * as Vixeny from "vixeny";

type StaticServer = {
  preserveExtension?: boolean;
  uses?: PluginTuple[];
};

export const remarkStaticServer = (args: {
  unified: typeof unified;
  options?: StaticServer;
  plugins: typeof Vixeny.plugins;
  petitions: typeof Vixeny.petitions;
}) => {
  const { unified, options, petitions, plugins } = args;

  const pro = (options?.uses ?? []).reduce(
    (acc, v) => acc.use(...v),
    unified(),
  );
  return plugins.staticFilePlugin(
    {
      checker: (ctx) => ctx.path.includes(".md"),
      p: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) =>
        petitions.response()(
          {
            path: options && "preserveExtension" in options &&
                !options.preserveExtension
              ? ob.relativeName.slice(0, -3)
              : ob.relativeName,
            r: ((v) => async () =>
              new Response(
                v === ""
                  ? v = String(
                    await pro.process(readFileSync(ob.path, "utf8")),
                  )
                  : v,
                {
                  headers: new Headers([
                    ["content-type", "text/html"],
                    ["Access-Control-Allow-Origin", "*"],
                  ]),
                },
              ))(""),
          } as const,
        ),
    },
  );
};
