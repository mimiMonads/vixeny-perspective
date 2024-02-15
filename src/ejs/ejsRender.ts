import * as ejsModule from "ejs";
import { Petition } from "vixeny/components/http/src/framework/optimizer/types";
import { FunRouterOptions  } from "vixeny/components/http/types";

const getName = (o: FunRouterOptions) => (sym: symbol) =>
  Object
    .keys(o?.cyclePlugin ?? [])
    //@ts-ignore
    .find((name) => o?.cyclePlugin[name].name === sym) as string;

const getOptions = (userOptions: Petition) => (currentName: string) =>
  "plugins" in userOptions && userOptions.plugins
    ? userOptions.plugins[currentName]
    : null;
    
type Options = ejsModule.Options
type Compiled = {template: string, opts: Options}
typeof ejsModule.compile
typeof ejsModule.render
typeof ejsModule.renderFile


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
        throw new Error("Expecting source in: " + currentName  + ', did you added \'template\'?');
      }

      try {
        return compile(options.template, options.opts);
      } catch (e) {
        throw new Error(
          "The pluging : " + currentName + " has panicked in : " +
            userOptions.path,
        );
      }
    },
  }))(Symbol("composeCompiled"));
    1
