import * as ejsModule from "ejs";
import { plugins } from "vixeny";

const {
  getName,
  getOptions,
  type
} = plugins;



type Options = ejsModule.Options;
type Compiled = { template: string; opts?: Options };

export const ejsComposeCompiled = (compile: typeof ejsModule.compile) =>
  ((sym) => type({
    name: sym,
    isFunction: true,
    type: {} as Compiled,
    // This plugin does not have a specific type requirement
    f: (o) => (userOptions) => {
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
  ((sym) => type({
    name: sym,
    isFunction: true,
    type: undefined,
    f: () => () => render,
  }))(Symbol("ejsRender"));

export const ejsComposeRenderFile = (renderFile: typeof ejsModule.renderFile) =>
  ((sym) => type({
    name: sym,
    isFunction: true,
    type: {} as never,
    f: () => () => renderFile,
  }))(Symbol("ejsRenderFile"));
