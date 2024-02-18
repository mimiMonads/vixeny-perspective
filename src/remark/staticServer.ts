import {unified,PluginTuple} from "unified";
import {readFileSync} from "node:fs"



type StaticServer = {
    preserveExtension?: boolean;
    uses? : PluginTuple[]
  };

  export const remarkStaticServer = (remark: typeof unified)=> (option?: StaticServer) => (
    pro => ({
      checker: (path: string) => path.includes(".md"),
      r: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) =>
        ({
          type: "response",
          path:
            option && "preserveExtension" in option && !option.preserveExtension
              ? ob.relativeName.slice(0, -2)
              : ob.relativeName,
          r: async () =>
             new Response( String(await pro.process(readFileSync(ob.path, "utf8"))), {
              headers: new Headers([
                ["content-type", "text/html"],
              ]),
            }),
        } as const)
    })
  )(
    (option?.uses ?? []).reduce( (acc, v) => acc.use(...v ) , remark())
  );
  
  