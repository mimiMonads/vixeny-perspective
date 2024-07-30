import { petitions, plugins } from "vixeny";
import { compile } from "svelte/compiler";

type Petition = ReturnType<ReturnType<typeof petitions.common>>;

type petitionType = (r: Request) => Record<string, any> | null;

type StaticServer = {
  preserveExtension?: boolean;
  default?: Record<string, any>;
  thisGlobalOptions?: ReturnType<typeof plugins.globalOptions>;
  globalF?: petitionType;
  f?: Petition;
};

const onLazy =
  (comp: typeof compile) =>
  (defaults?: Record<string, any>) =>
  (path: string) =>
    (
      (template) =>
        // def means default
        ((def) => (h: Record<string, string>) =>
          new Response(def, {
            headers: h,
          }))(
            comp(defaults || {}),
          )
    )(
      compile(path),
    );

const onPetition =
  (petition: petitionType) =>
  (comp: typeof compile) =>
  (defaults?: Record<string, any>) =>
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
              maybeOfObj === null ? def : comp(maybeOfObj),
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
          comp(defaults || {}),
        )
    )(
      compile(path),
    );

export const svelteStaticServerPlugin =
  (comp: typeof compile) => (option?: StaticServer) =>
    plugins.staticFilePlugin({
      type: "request",
      checker: (path: string) => path.includes(".svelte"),
      f: (ob) =>
        petitions.custom(option?.thisGlobalOptions)(
          {
            path: option && "preserveExtension" in option &&
                !option.preserveExtension
              ? ob.relativeName.slice(0, -7)
              : ob.relativeName,
            // Headings
            headings: {
              headers: ".html",
            },
            // Only
            options: {
              only: ["headers", "req"],
            },
            f: option && option.globalF
              ? ((fun) => ({ headers, req }) => fun(req)(headers))(
                onPetition(option.globalF)(comp)(option?.default)(
                  ob.path,
                ),
              )
              : ((fun) => ({ headers }) => fun(headers))(
                onLazy(comp)(option?.default)(ob.path),
              ),
          } as const,
        ),
    });
