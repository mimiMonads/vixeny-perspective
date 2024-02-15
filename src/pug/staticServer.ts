import * as pugModule from "pug";

type StaticServer = {
  preserveExtension?: boolean;
  default?: pugModule.LocalsObject;
};

export const pugStaticServerPlugin =
  (compileFile: typeof pugModule.compileFile) => (option?: StaticServer) => ({
    checker: (path: string) => path.includes(".pug"),
    r: (ob: {
      root: string;
      path: string;
      relativeName: string;
    }) =>
      ((def: pugModule.LocalsObject) => (file: pugModule.compileTemplate) => ({
        type: "response",
        path:
          option && "preserveExtension" in option && !option.preserveExtension
            ? ob.relativeName.slice(0, -4)
            : ob.relativeName,
        r: () =>
          new Response(file(def), {
            headers: new Headers([
              ["content-type", "text/html"],
            ]),
          }),
      } as const))(
        option && option.default ? option.default : {},
      )(
        compileFile(ob.path),
      ),
  });
