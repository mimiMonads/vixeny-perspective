import type * as pugModule from "pug";
import type * as Vixeny from "vixeny";
import type { pluginType } from "../../type.ts";

// Define a type for a Petition, which is the return type of Vixeny.petitions.common
type Petition = ReturnType<ReturnType<typeof Vixeny.petitions.common>>;

// Define the options for the StaticServer
type StaticServer = {
  preserveExtension?: boolean;
  petition: Petition;
};

// Create unique symbols for plugin names to avoid naming collisions
const symbolRenderFilePug = Symbol("renderFilePug");
const defaultFilePugSymbol = Symbol("defaultFilePug");

/**
 * Creates a plugin to render Pug files using the provided compileFile function.
 */
const renderFilePug = (args: {
  compileFile: typeof pugModule.compileFile;
  plugins: pluginType;
}) => {
  const { compileFile, plugins } = args;

  return plugins.type({
    name: symbolRenderFilePug,
    isFunction: true,
    isAsync: false,
    type: {} as pugModule.Options,
    f: (ctx) => {
      const currentName = ctx.currentName(symbolRenderFilePug);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (typeof globalOptions.cyclePlugin[symbolRenderFilePug] !== "object") {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFilePug];
      const path = optionsFromGO.path as string;

      // Retrieve options from the current petition
      const currentOptions = ctx.getOptionsFromPetition<pugModule.Options>(
        currentPetition,
      )(currentName) ?? {};

      const template = compileFile(path, currentOptions);

      return (data: pugModule.LocalsObject | void) => template(data ?? {});
    },
  });
};

/**
 * Creates a plugin to render default Pug files with optional default data.
 */
const defaultFilePug = (args: {
  compileFile: typeof pugModule.compileFile;
  defaults?: pugModule.LocalsObject;
  plugins: pluginType;
}) => {
  const { compileFile, defaults, plugins } = args;

  return plugins.type({
    name: defaultFilePugSymbol,
    isFunction: false,
    isAsync: false,
    type: {} as pugModule.Options,
    f: (ctx) => {
      const currentName = ctx.currentName(symbolRenderFilePug);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (typeof globalOptions.cyclePlugin[symbolRenderFilePug] !== "object") {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFilePug];
      const path = optionsFromGO.path as string;

      // Retrieve options from the current petition
      const currentOptions = ctx.getOptionsFromPetition<pugModule.Options>(
        currentPetition,
      )(currentName) ?? {};

      const template = compileFile(path, currentOptions);
      const res = template(defaults ?? {});

      return () => res;
    },
  });
};

/**
 * Plugin to serve Pug files using Vixeny petitions.
 */
export const pugToPetition = (args: {
  petitions: typeof Vixeny.petitions;
  compileFile: typeof pugModule.compileFile;
  defaults?: pugModule.LocalsObject;
  plugins: pluginType;
}) => {
  const { compileFile, defaults, plugins, petitions } = args;

  const defaultPug = defaultFilePug({
    compileFile,
    defaults,
    plugins,
  });

  const renderPug = renderFilePug({
    compileFile,
    plugins,
  });

  return petitions.sealableAdd({
    cyclePlugin: {
      defaultPug,
      renderPug,
    },
  });
};

/**
 * Plugin to handle serving static Pug files.
 */
export const pugStaticServerPlugin = ({
  plugins,
  options,
}: {
  plugins: typeof Vixeny.plugins;
  options: StaticServer;
}) => {
  return plugins.staticFilePlugin({
    type: "add",
    checker: (ctx) => ctx.path.includes(".pug"),
    p: (file) => ({
      ...options.petition,
      // Lazy loading by default
      // lazy: true,
      // Safely passing the context to the plugin
      o: {
        ...options.petition.o ?? {},
        cyclePlugin: {
          ...options.petition.o?.cyclePlugin,
          [defaultFilePugSymbol]: file,
          [symbolRenderFilePug]: file,
        },
      },
      // Determine the router path
      path: options &&
          "preserveExtension" in options &&
          !options.preserveExtension
        ? file.relativeName.slice(0, -4) // Remove the '.pug' extension
        : file.relativeName,
    }),
  });
};
