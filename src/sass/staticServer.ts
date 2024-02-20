import  * as sassModule from 'sass';


type StaticServer = {
    uses?: sassModule.Options<"sync">;
};

export const sassStaticServer =
(sass:  typeof sassModule) => (option?: StaticServer) =>
  (
   ({
      checker: (path: string) => path.includes(".scss"),
      r: (ob: {
        root: string;
        path: string;
        relativeName: string;
      }) => ({
        type: "response",
        path: ob.relativeName.slice(0, -5) + '.css',
        r: ((v) => async () =>
          new Response(
            v === ""
              ? 
                v = sass.compile(ob.path, option?.uses).css
              : v,
            {
              headers: new Headers([
                ["content-type", "text/css"],
              ]),
            },
          ))(""),
      } as const),
    })
  )
