import * as ejsModule from "ejs";
import { petitions, plugins } from "vixeny";

type Petition = ReturnType<ReturnType<typeof petitions.common>>;
type petitionType = (r: Request) => ejsModule.Data | null;

type StaticServer = {
  preserveExtension?: boolean;
  default?: ejsModule.Data;
  thisGlobalOptions?: ReturnType<typeof plugins.globalOptions>;
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

export const ejsStaticServerPlugin =
  (renderFile: typeof ejsModule.renderFile) => (option?: StaticServer) =>
    plugins.staticFilePlugin({
      type: "request",
      checker: (path: string) => path.includes(".ejs"),
      f: (ob) =>
        petitions.custom(option?.thisGlobalOptions)(
          {
            path: option && "preserveExtension" in option &&
                !option.preserveExtension
              ? ob.relativeName.slice(0, -4)
              : ob.relativeName,
            options: {
              only: ["headers", "req"],
            },
            f: option && option.globalF
              ? ((fun) => ({ headers, req }) => fun(headers, req))(
                onPetition(option.globalF)(renderFile)(option?.default)(
                  ob.path,
                ),
              )
              : ((fun) => ({ headers }) => fun(headers))(
                onLazy(renderFile)(option?.default ?? {})(ob.path),
              ),
          } as const,
        ),
    });
