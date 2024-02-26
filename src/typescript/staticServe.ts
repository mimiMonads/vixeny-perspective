import esbuild, { TransformOptions } from "esbuild";

type options = Omit<TransformOptions, "entryPoints">;

type StaticServer = {};

export const typescriptStaticServer =
  (build: typeof esbuild) => (esOptions?: StaticServer) => (
    {
      checker: (path: string) => path.includes(".ts"),
      r: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) => ({
        type: "response",
        path: ob.relativeName.slice(0, -3) + ".mjs",
        r: ((v) => async () =>
          new Response(
            v === ""
              ? v = (await build.build(
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
      } as const),
    }
  );
