import { PluginTuple, unified } from "unified";
import { readFileSync } from "node:fs";
import { petitions } from "vixeny";

type StaticServer = {
  preserveExtension?: boolean;
  uses?: PluginTuple[];
};

export const remarkStaticServer =
  (remark: typeof unified) => (option?: StaticServer) =>
    (
      (pro) => ({
        checker: (path: string) => path.includes(".md"),
        r: (ob: {
          root: string;
          path: string;
          relativeName: string;
        }) =>
          petitions.response()(
            {
              path: option && "preserveExtension" in option &&
                  !option.preserveExtension
                ? ob.relativeName.slice(0, -3)
                : ob.relativeName,
              r: ((v) => async () =>
                new Response(
                  v === ""
                    ? v = String(
                      await pro.process(readFileSync(ob.path, "utf8")),
                    )
                    : v,
                  {
                    headers: new Headers([
                      ["content-type", "text/html"],
                    ]),
                  },
                ))(""),
            } as const,
          ),
      })
    )(
      (option?.uses ?? []).reduce((acc, v) => acc.use(...v), remark()),
    );
