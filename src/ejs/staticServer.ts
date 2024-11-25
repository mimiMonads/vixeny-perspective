import type * as ejsModule from "ejs";
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
const symbolRenderFileEJS = Symbol("renderFileEJS");
const defaultFileEJSSymbol = Symbol("defaultFileEJS");

/**
 * Creates a plugin to render EJS files using the provided renderFile function.
 */
const renderFileEJS = (args: {
  renderFile: typeof ejsModule.renderFile;
  plugins: pluginType;
}) => {
  const { renderFile, plugins } = args;

  return plugins.type({
    name: symbolRenderFileEJS,
    isFunction: true,
    isAsync: true,
    type: {} as ejsModule.Options,
    f: async (ctx) => {
      const currentName = ctx.currentName(symbolRenderFileEJS);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (typeof globalOptions.cyclePlugin[symbolRenderFileEJS] !== "object") {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options, possible because of `ejsStaticServerPlugin`
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFileEJS];
      const path = optionsFromGO.path as string;

      // Retrieve options from the current petition
      const currentOptions = ctx.getOptionsFromPetition<ejsModule.Options>(
        currentPetition,
      )(currentName) ?? {};

      return async (data: ejsModule.Data | void) =>
        await renderFile(path, data ?? {}, currentOptions);
    },
  });
};

/**
 * Creates a plugin to render default EJS files with optional default data.
 */
const defaultFileEJS = (args: {
  renderFile: typeof ejsModule.renderFile;
  defaults?: ejsModule.Data;
  plugins: pluginType;
}) => {
  const { renderFile, defaults, plugins } = args;

  return plugins.type({
    name: defaultFileEJSSymbol,
    isFunction: false,
    isAsync: true,
    type: {} as ejsModule.Options,
    f: async (ctx) => {
      const currentName = ctx.currentName(symbolRenderFileEJS);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (typeof globalOptions.cyclePlugin[symbolRenderFileEJS] !== "object") {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFileEJS];
      const path = optionsFromGO.path as string;

      // Retrieve options from the current petition
      const currentOptions = ctx.getOptionsFromPetition<ejsModule.Options>(
        currentPetition,
      )(currentName) ?? {};

      const res = await renderFile(path, defaults, currentOptions);

      return () => res;
    },
  });
};

/**
 * Plugin to serve EJS files using Vixeny petitions.
 */
export const ejsToPetition = (args: {
  petitions: typeof Vixeny.petitions;
  renderFile: typeof ejsModule.renderFile;
  defaults?: ejsModule.Data;
  plugins: pluginType;
}) => {
  const { renderFile, defaults, plugins, petitions } = args;
  const defaultEJS = defaultFileEJS({
    renderFile,
    defaults,
    plugins,
  });

  const renderEJS = renderFileEJS({
    renderFile,
    plugins,
  });

  return petitions.sealableAdd({
    cyclePlugin: {
      defaultEJS,
      renderEJS,
    },
  });
};

/**
 * Plugin to handle serving static EJS files.
 */
export const ejsStaticServerPlugin = ({
  plugins,
  options,
}: {
  plugins: typeof Vixeny.plugins;
  options: StaticServer;
}) => {
  return plugins.staticFilePlugin({
    type: "add",
    checker: (ctx) => ctx.path.includes(".ejs"),
    p: (file) => ({
      ...options.petition,
      // Lazy loading by default
      lazy: true,
      // Safely passing the context to the plugin
      o: {
        ...options.petition.o ?? {},
        cyclePlugin: {
          ...options.petition.o?.cyclePlugin,
          [defaultFileEJSSymbol]: file,
          [symbolRenderFileEJS]: file,
        },
      },
      // Determine the router path
      path: options &&
          "preserveExtension" in options &&
          !options.preserveExtension
        ? file.relativeName.slice(0, -4) // Remove the '.ejs' extension
        : file.relativeName,
    }),
  });
};
