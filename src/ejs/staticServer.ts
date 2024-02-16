import * as ejsModule from "ejs";

type StaticServer = {
  preserveExtension?: boolean;
  default?: ejsModule.Data;
};

export const ejsStaticServerPlugin =
  (renderFile: typeof ejsModule.renderFile) => (option?: StaticServer) => ({
    checker: (path: string) => path.includes(".ejs"),
    r: (ob: {
      root: string;
      path: string;
      relativeName: string;
    }) =>  ({
      type: "response",
      path: option && "preserveExtension" in option && !option.preserveExtension
        ? ob.relativeName.slice(0, -4)
        : ob.relativeName,
      r: async () =>
        new Response( 
         await renderFile(
            ob.path, 
            option && option.default ? option.default : {},
             {
              root: ob.path.slice(0,ob.path.lastIndexOf('/'))
            }
         ),
          {
            headers: new Headers([
              ["content-type", "text/html"],
            ]),
          },
        ),
    } as const),
  });

