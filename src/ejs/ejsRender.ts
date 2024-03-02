import * as ejsModule from "ejs";
import { FunRouterOptions, Petition } from "vixeny/types";

const getName = (o: FunRouterOptions) => (sym: symbol) =>
  Object
    .keys(o?.cyclePlugin ?? [])
    //@ts-ignore
    .find((name) => o?.cyclePlugin[name].name === sym) as string;

const getOptions = (userOptions: Petition) => (currentName: string) =>
  "plugins" in userOptions && userOptions.plugins
    ? userOptions.plugins[currentName]
    : null;

type Options = ejsModule.Options;
type Compiled = { template: string; opts?: Options };

export const ejsComposeCompiled = (compile: typeof ejsModule.compile) =>
  ((sym) => ({
    name: sym,
    isFunction: true,
    type: {} as Compiled,
    // This plugin does not have a specific type requirement
    f: (o: FunRouterOptions) => (userOptions: Petition) => {
      //getting name
      const currentName = getName(o)(sym);

      const options = getOptions(userOptions)(currentName) as Compiled;

      if (options === null || options === undefined) {
        throw new Error(
          "Expecting source in: " + currentName + ", did you added 'template'?",
        );
      }

      try {
        return compile(options.template, options.opts) as (
          data: ejsModule.Data,
        ) => string;
      } catch (e) {
        throw new Error(
          "The pluging : " + currentName + " has panicked in : " +
            userOptions.path,
        );
      }
    },
  }))(Symbol("ejsComposeCompiled"));

export const ejsRender = (render: typeof ejsModule.render) =>
  ((sym) => ({
    name: sym,
    isFunction: true,
    type: undefined,
    f: (_: FunRouterOptions) => (_: Petition) => render,
  }))(Symbol("ejsRender"));

export const ejsComposeRenderFile = (renderFile: typeof ejsModule.renderFile) =>
  ((sym) => ({
    name: sym,
    isFunction: true,
    type: {} as never,
    f: (_: FunRouterOptions) => (_: Petition) => renderFile,
  }))(Symbol("ejsRenderFile"));
