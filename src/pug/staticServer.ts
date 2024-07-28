import { petitions, plugins } from "vixeny";
import * as pugModule from "pug";

type petitionType = (r: Request) => pugModule.LocalsObject | null;

type StaticServer = {
  preserveExtension?: boolean;
  default?: pugModule.LocalsObject;
  petition?: petitionType;
};

const onLazy =
  (compileFile: typeof pugModule.compileFile) =>
  (defaults?: pugModule.LocalsObject) =>
  (path: string) =>
    (
      (template) =>
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

export const pugStaticServerPlugin =
  (compileFile: typeof pugModule.compileFile) => (option?: StaticServer) =>
    plugins.staticFilePlugin({
      type: "request",
      checker: (path: string) => path.includes(".pug"),
      f: (ob) =>
        petitions.custom()(
          {
            path: option && "preserveExtension" in option &&
                !option.preserveExtension
              ? ob.relativeName.slice(0, -4)
              : ob.relativeName,
            headings: {
              headers: ".html",
            },
            f: option && "petition" in option && option.petition
              ? ((fun) => ({ headers, req }) => fun(req)(headers))(
                onPetition(option.petition)(compileFile)(option?.default)(
                  ob.path,
                ),
              )
              : ((fun) => ({ headers }) => fun(headers))(
                onLazy(compileFile)(option?.default)(ob.path),
              ),
          } as const,
        ),
    });
