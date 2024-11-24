import type * as ReactModule from "react";
import type * as ReactDOMServer from "react-dom/server";
import path from "node:path";
import type * as Vixeny from "vixeny";
import type { pluginType } from "../../type.ts";

// Define a type for a Petition, which is the return type of Vixeny.petitions.common
type Petition = ReturnType<ReturnType<typeof Vixeny.petitions.common>>;

// Define the options for the StaticServer
type StaticServer = {
  root: string;
  preserveExtension?: boolean;
  petition: Petition;
};

type Props = { [data: string]: any } | void;

type ReactUsedType = {
  createElement: typeof ReactModule.createElement;
  [key: string | number | symbol]: any;
};

// Create unique symbols for plugin names to avoid naming collisions
const symbolRenderFileTSX = Symbol("renderFileTSX");
const defaultFileTSXSymbol = Symbol("defaultFileTSX");

/**
 * Creates a plugin to render TSX files using React and ReactDOMServer.
 */
const renderFileTSX = (args: {
  createElement: typeof ReactModule.createElement;
  ReactDOMServer: typeof ReactDOMServer;
  root: string;
  plugins: pluginType;
}) => {
  const { createElement, ReactDOMServer, root, plugins } = args;

  return plugins.type({
    name: symbolRenderFileTSX,
    isFunction: true,
    isAsync: true,
    type: {} as Props,
    f: async (ctx) => {
      const currentName = ctx.currentName(symbolRenderFileTSX);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (typeof globalOptions.cyclePlugin[symbolRenderFileTSX] !== "object") {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFileTSX];
      const componentPath = optionsFromGO.path as string;

      const modulePath = path.join(root, componentPath);

      // Use the rendering function to compile and load the component
      //@ts-ignore
      const Component = await import(modulePath).default;

      return (data: Props) => {
        const element = createElement(Component, data ?? null);
        return ReactDOMServer.renderToString(element);
      };
    },
  });
};

/**
 * Creates a plugin to render default TSX files.
 */
const defaultFileTSX = (args: {
  createElement: typeof ReactModule.createElement;
  ReactDOMServer: typeof ReactDOMServer;
  root: string;
  plugins: pluginType;
}) => {
  const { createElement, ReactDOMServer, root, plugins } = args;

  return plugins.type({
    name: defaultFileTSXSymbol,
    isFunction: false,
    isAsync: true,
    type: {},
    f: async (ctx) => {
      const currentName = ctx.currentName(symbolRenderFileTSX);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (typeof globalOptions.cyclePlugin[symbolRenderFileTSX] !== "object") {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFileTSX];
      const componentPath = optionsFromGO.path as string;

      const modulePath = path.join(root, componentPath);

      // Use the rendering function to compile and load the component

      //@ts-ignore
      const Component = (await import(modulePath)).default;

      // Create a React element and render it to HTML
      const element = createElement(Component);
      const html = ReactDOMServer.renderToString(element);

      return () => html;
    },
  });
};

/**
 * Plugin to serve TSX files using Vixeny petitions.
 */
export const tsxStaticServePlugin = (arg: {
  petitions: typeof Vixeny.petitions;
  React: ReactUsedType;
  ReactDOMServer: typeof ReactDOMServer;
  root: string;
  plugins: pluginType;
}) => {
  const {
    React: { createElement },
    ReactDOMServer,
    root,
    plugins,
    petitions,
  } = arg;

  return petitions.sealableAdd({
    cyclePlugin: {
      renderTSX: renderFileTSX({
        createElement,
        ReactDOMServer,
        root,
        plugins,
      }),
      defaultTSX: defaultFileTSX({
        createElement,
        ReactDOMServer,
        root,
        plugins,
      }),
    },
  });
};

/**
 * Plugin to handle serving static TSX files.
 */
export const tsxStaticServerPlugin = ({
  plugins,
  options,
}: {
  plugins: typeof Vixeny.plugins;
  options: StaticServer;
}) => {
  return plugins.staticFilePlugin({
    type: "add",
    checker: (ctx) => ctx.path.endsWith(".tsx"),
    p: (file) => ({
      ...options.petition,
      // Lazy loading by default
      lazy: true,
      // Safely passing the context to the plugin
      o: {
        ...options.petition.o ?? {},
        cyclePlugin: {
          ...options.petition.o?.cyclePlugin,
          [defaultFileTSXSymbol]: file,
          [symbolRenderFileTSX]: file,
        },
      },
      // Determine the router path
      path: options &&
          "preserveExtension" in options &&
          !options.preserveExtension
        ? file.relativeName.slice(0, -4) // Remove the '.tsx' extension
        : file.relativeName,
    }),
  });
};
