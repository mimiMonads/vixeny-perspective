import { compileFile } from "pug";

type StaticServer = {
  preserveExtension?: boolean;
  default?: { [key: string]: any };
};

export const pugStaticServerPlugin = (option?: StaticServer) => ({
  checker: (path: string) => path.includes(".pug"),
  r: (ob: {
    root: string;
    path: string;
    relativeName: string;
  }) =>
    ((def) => (file) => ({
      type: "response" ,
      path: option &&  'preserveExtension' in option && !option.preserveExtension
        ? ob.relativeName.slice(0, -4)
        : ob.relativeName,
      r: () => new Response(file(def), {
        headers: new Headers([
          ["content-type", "text/html"]
        ])
      }),
    } as const 
    ))(
      option && option.default ? option.default : null,
    )(
      compileFile(ob.path),
    ),
});
