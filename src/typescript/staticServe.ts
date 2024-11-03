import type * as esbuild from "esbuild";
import type * as Vixeny from "vixeny";

// Add stuf xd

type StaticServer = {};

export const typescriptStaticServer = (args: {
  esbuild: typeof esbuild;
  esOptions?: StaticServer;
  plugins: typeof Vixeny.plugins;
  petitions: typeof Vixeny.petitions;
}) => {
  const { esbuild, plugins, petitions } = args;

  return plugins.staticFilePlugin({
    checker: (ctx) => ctx.path.includes(".ts"),
    p: (ob: {
      root: string;
      path: string;
      relativeName: string;
    }) =>
      petitions.response()(
        {
          path: ob.relativeName.slice(0, -3) + ".mjs",
          r: ((v) => async () =>
            new Response(
              v === ""
                ? v = (await esbuild.build(
                  {
                    ...{
                      entryPoints: [ob.path], // Entry point of your TypeScript code
                      bundle: true, // Enable bundling
                      write: false, // Prevent writing to disk
                      platform: "browser", // or 'browser', depending on your target
                      format: "esm", // Output format (e.g., 'cjs' for CommonJS, 'esm' for ES Modules)
                      outdir: "out", // Specify an output directory (required even if write: false)
                      metafile: true, // Enable metadata generation to capture output details
                    },
                  },
                )).outputFiles[0].text
                : v,
              {
                headers: new Headers([
                  ["content-type", "application/javascript"],
                ]),
              },
            ))(""),
        } as const,
      ),
  });
};
