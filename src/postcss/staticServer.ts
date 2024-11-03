import postcss from "postcss";
import fs from "node:fs";
import * as Vixeny from "vixeny";

type uses = postcss.AcceptedPlugin[];

type StaticServer = {
  uses?: uses;
};

export const postcssStaticServer = (args: {
  postcss: typeof postcss;
  options?: StaticServer;
  petitions: typeof Vixeny.petitions;
  plugins: typeof Vixeny.plugins;
}) => {
  const { postcss, options, petitions, plugins } = args;

  const pro = postcss(options?.uses ?? []);

  return plugins.staticFilePlugin(
    plugins.staticFilePlugin({
      checker: (ctx) => ctx.path.includes(".css"),
      p: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) =>
        petitions.response()(
          {
            path: ob.relativeName,
            r: ((v) => async () =>
              new Response(
                v === ""
                  ? v = await pro
                    .process(fs.readFileSync(ob.path, "utf8"), {
                      from: ob.path,
                    })
                    .then((result) => result.css)
                  : v,
                {
                  headers: new Headers([
                    ["content-type", "text/css"],
                  ]),
                },
              ))(""),
          } as const,
        ),
    }),
  );
};
