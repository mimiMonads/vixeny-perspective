import postcss from "postcss";
import fs from "node:fs";

type uses = postcss.AcceptedPlugin[];

type StaticServer = {
  uses?: uses;
};

export const postcssStaticServer =
  (post: typeof postcss) => (option?: StaticServer) =>
    (
      (pro) => ({
        checker: (path: string) => path.includes(".css"),
        r: (ob: {
          root: string;
          path: string;
          relativeName: string;
        }) => ({
          type: "response",
          path: ob.relativeName,
          r: ((v) => async () =>
            new Response(
              v === ""
                ? v = await pro
                  .process(fs.readFileSync(ob.path, "utf8"), { from: ob.path })
                  .then((result) => result.css)
                : v,
              {
                headers: new Headers([
                  ["content-type", "text/css"],
                ]),
              },
            ))(""),
        } as const),
      })
    )(
      post(option?.uses ?? []),
    );
