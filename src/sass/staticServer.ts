import type * as Vixeny from "vixeny";
import type * as sassModule from "sass";

type StaticServer = {
  uses?: sassModule.Options<"sync">;
};

export const sassStaticServer = (args: {
  petitions: typeof Vixeny.petitions;
  plugins: typeof Vixeny.plugins;
  sass: typeof sassModule;
  options?: StaticServer;
}) => {
  const { petitions, plugins, sass, options } = args;
  return plugins.staticFilePlugin(
    {
      checker: (ctx) => ctx.path.includes(".scss"),
      p: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) =>
        petitions.response()({
          path: ob.relativeName.slice(0, -5) + ".css",
          r: ((v) => async () =>
            new Response(
              v === "" ? v = sass.compile(ob.path, options?.uses).css : v,
              {
                headers: new Headers([
                  ["content-type", "text/css"],
                ]),
              },
            ))(""),
        }),
    },
  );
};
