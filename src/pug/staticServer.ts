import { petitions } from "vixeny";
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
        ((def) => (r: Request) =>
          new Response(def, {
            headers: new Headers([
              ["content-type", "text/html"],
            ]),
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
        ((def) => (r: Request) =>
          (
            (ob) =>
              new Response(ob === null ? def : template(ob), {
                headers: new Headers([
                  ["content-type", "text/html"],
                ]),
              })
          )(
            petition(r),
          ))(
            template(defaults || {}),
          )
    )(
      compileFile(path),
    );

export const pugStaticServerPlugin =
  (compileFile: typeof pugModule.compileFile) => (option?: StaticServer) => ({
    checker: (path: string) => path.includes(".pug"),
    r: (ob: {
      root: string;
      path: string;
      relativeName: string;
    }) => petitions.response()({

      path: option && "preserveExtension" in option && !option.preserveExtension
        ? ob.relativeName.slice(0, -4)
        : ob.relativeName,
      r: option && "petition" in option && option.petition
        ? onPetition(option.petition)(compileFile)(option?.default)(ob.path)
        : onLazy(compileFile)(option?.default)(ob.path),
    } as const),
  });
