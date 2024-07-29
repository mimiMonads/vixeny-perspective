import * as ejsModule from "ejs";
import { petitions, plugins } from "vixeny";
type Petition = ReturnType<ReturnType<typeof petitions.common>>

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
      renderFile(path, defaults || {}, {}),
    );

const onPetition =
  (petition: petitionType) =>
  (renderFile: typeof ejsModule.renderFile) =>
  (defaults?: ejsModule.Data) =>
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
              maybeOfObj === null ? def : template(maybeOfObj, {}),
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
      renderFile(path, defaults || {}, {}),
    );

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
            // Headings
            headings: {
              headers: ".html",
            },
            // Only 
            options: {
              only: ['headers', 'req' ]
            },
            f: option &&  option.globalF  
              ? ((fun) => ({ headers, req }) => fun(req)(headers))(
                onPetition(option.globalF)(renderFile)(option?.default)(
                  ob.path,
                ),
              )
              : ((fun) => ({ headers }) => fun(headers))(
                onLazy(renderFile)(option?.default)(ob.path),
              ),
          } as const,
        ),
    });
