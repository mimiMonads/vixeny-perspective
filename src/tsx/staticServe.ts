import esbuild, { TransformOptions } from "esbuild";

type options = Omit<TransformOptions, "entryPoints">;

type StaticServer = {};

export const tsxStaticServer =
  (build: typeof esbuild) => (esOptions?: StaticServer) => (
    {
      checker: (path: string) => path.endsWith(".tsx") || path.endsWith(".jsx"),
      r: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) => ({
        type: "response",
        path:
          ob.relativeName.endsWith(".tsx") || ob.relativeName.endsWith(".jsx")
            ? ob.relativeName.slice(0, -4)
            : ob.relativeName.slice(0, -3),
        r: ((v) => async () =>
          new Response(
            v === ""
              ? v = (await build.build({
                entryPoints: [ob.path], // Entry point of your code
                bundle: true, // Enable bundling
                write: false, // Prevent writing to disk
                platform: "browser", // Specify platform
                format: "esm", // Output format (ES Modules)
                loader: { ".tsx": "tsx", ".jsx": "jsx" }, // Specify loaders for .tsx and .jsx
                outdir: "out", // Specify an output directory
                metafile: true, // Enable metadata generation
              })).outputFiles[0].text
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
