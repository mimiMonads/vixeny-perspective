import type * as Vixeny from "vixeny";
import * as pugModule from "pug";

type Petition = ReturnType<ReturnType<typeof Vixeny.petitions.common>>;

type petitionType = (r: Request) => pugModule.LocalsObject | null;

type StaticServer = {
  preserveExtension?: boolean;
  default?: pugModule.LocalsObject;
  thisGlobalOptions?: ReturnType<typeof Vixeny.plugins.globalOptions>;
  globalF?: petitionType;
  f?: Petition;
};

const onLazy =
  (compileFile: typeof pugModule.compileFile) =>
  (defaults?: pugModule.LocalsObject) =>
  (path: string) =>
    (
      (template) =>
        // def means default
        ((def) => (h: Record<string, string>) =>
          new Response(def, {
            headers: h,
          }))(
            template(defaults || {}),
          )
    )(
      compileFile(path),
    );

const onPetition =
  (petition: petitionType) =>
  (compileFile: typeof pugModule.compileFile) =>
  (defaults?: pugModule.LocalsObject) =>
  (path: string) =>
    (
      (template) =>
        // def means default
        ((def) => (r: Request) => (h: Record<string, string>) => {
          try {
            // Getting the petition
            const maybeOfObj = petition(r);

            // Returning the template
            return new Response(
              maybeOfObj === null ? def : template(maybeOfObj),
              {
                headers: h,
              },
            );
          } catch (e: unknown) {
            if (e instanceof Response) {
              return e;
            }

            return new Response(null, {
              status: 500,
            });
          }
        })(
          template(defaults || {}),
        )
    )(
      compileFile(path),
    );

export const pugStaticServerPlugin = (arg: {
  compileFile: typeof pugModule.compileFile;
  option?: StaticServer;
  plugins: typeof Vixeny.plugins;
  petitions: typeof Vixeny.petitions;
}) => {
  const { compileFile, option, plugins, petitions } = arg;

  return plugins.staticFilePlugin({
    type: "add",
    checker: (ctx) => ctx.path.includes(".pug"),
    p: (ob) =>
      petitions.custom(option?.thisGlobalOptions)(
        {
          path: option && "preserveExtension" in option &&
              !option.preserveExtension
            ? ob.relativeName.slice(0, -4)
            : ob.relativeName,
          // Headings
          headings: {
            headers: ".html",
          },
          // Only
          options: {
            add: ["headers", "req"],
          },
          f: option && option.globalF
            ? ((fun) => ({ headers, req }) => fun(req)(headers))(
              onPetition(option.globalF)(compileFile)(option?.default)(
                ob.path,
              ),
            )
            : ((fun) => ({ headers }) => fun(headers))(
              onLazy(compileFile)(option?.default)(ob.path),
            ),
        },
      ),
  });
};
