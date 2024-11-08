import type * as ejsModule from "ejs";
import type * as Vixeny from "vixeny";

type Petition = ReturnType<ReturnType<typeof Vixeny.petitions.common>>;
type petitionType = (r: Request) => ejsModule.Data | null;

type StaticServer = {
  preserveExtension?: boolean;
  default?: ejsModule.Data;
  thisGlobalOptions?: ReturnType<typeof Vixeny.plugins.globalOptions>;
  globalF?: petitionType;
  f?: Petition;
};

const onLazy =
  (renderFile: typeof ejsModule.renderFile) =>
  (defaults?: ejsModule.Data) =>
  (path: string) =>
  async (headers: Record<string, string>) =>
    new Response(
      await renderFile(
        path,
        defaults ? defaults : {},
        {
          root: path.slice(0, path.lastIndexOf("/")),
        },
      ),
      {
        headers: headers,
      },
    );

const onPetition =
  (petition: petitionType) =>
  (renderFile: typeof ejsModule.renderFile) =>
  (defaults?: ejsModule.Data) =>
  (path: string) =>
  async (headers: Record<string, string>, req: Request) => {
    try {
      const maybeOfObj = petition(req);
      const data = maybeOfObj === null
        ? defaults
        : { ...defaults, ...maybeOfObj };
      return new Response(
        await renderFile(path, data, {
          root: path.slice(0, path.lastIndexOf("/")),
        }),
        { headers: headers },
      );
    } catch (e: unknown) {
      if (e instanceof Response) {
        return e;
      }
      return new Response(null, { status: 500 });
    }
  };

export const ejsStaticServerPlugin = (obj: {
  renderFile: typeof ejsModule.renderFile;
  plugins: typeof Vixeny.plugins;
  petitions: typeof Vixeny.petitions;
  options?: StaticServer;
}) => {
  const { renderFile, petitions, plugins, options } = obj;

  return plugins.staticFilePlugin({
    type: "add",
    checker: (ctx) => ctx.path.includes(".ejs"),
    p: (ob) =>
      petitions.custom(options?.thisGlobalOptions)(
        {
          path: options && "preserveExtension" in options &&
              !options.preserveExtension
            ? ob.relativeName.slice(0, -4)
            : ob.relativeName,
          options: {
            only: ["headers", "req"],
          },
          f: options && options.globalF
            ? ((fun) => ({ headers, req }) => fun(headers, req))(
              onPetition(options.globalF)(renderFile)(options?.default)(
                ob.path,
              ),
            )
            : ((fun) => ({ headers }) => fun(headers))(
              onLazy(renderFile)(options?.default ?? {})(ob.path),
            ),
        } as const,
      ),
  });
};
