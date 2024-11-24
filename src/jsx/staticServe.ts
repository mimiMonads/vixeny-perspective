import type * as ReactNative from "react";
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
  createElement: typeof ReactNative.createElement;
  [key: string | number | number]: any;
};

// Create unique symbols for plugin names to avoid naming collisions
const symbolRenderFileJSX = Symbol("renderFileJSX");
const defaultFileJSXSymbol = Symbol("defaultFileJSX");

/**
 * Creates a plugin to render JSX files using React and ReactDOMServer.
 */
const renderFileJSX = (args: {
  createElement: typeof ReactNative.createElement;
  ReactDOMServer: typeof ReactDOMServer;
  root: string;
  plugins: pluginType;
}) => {
  const { createElement, ReactDOMServer, root, plugins } = args;

  return plugins.type({
    name: symbolRenderFileJSX,
    isFunction: true,
    isAsync: true,
    type: {} as Props, // You can specify additional options here if needed
    f: async (ctx) => {
      const currentName = ctx.currentName(symbolRenderFileJSX);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (
        typeof globalOptions.cyclePlugin[symbolRenderFileJSX] !== "object"
      ) {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFileJSX];
      const componentPath = optionsFromGO.path as string;

      // Retrieve options from the current petition
      const currentOptions =
        ctx.getOptionsFromPetition(currentPetition)(currentName) ?? {};

      const modulePath = path.join(root, componentPath);
      const componentModule = await import(modulePath);
      const Component = componentModule.default;

      return (data: Props) => {
        const element = createElement(Component, data ?? null);
        return ReactDOMServer.renderToString(element);
      };
    },
  });
};

/**
 * Creates a plugin to render default JSX files.
 */
const defaultFileJSX = (args: {
  createElement: typeof ReactNative.createElement;
  ReactDOMServer: typeof ReactDOMServer;
  root: string;
  plugins: pluginType;
}) => {
  const { createElement, ReactDOMServer, root, plugins } = args;

  return plugins.type({
    name: defaultFileJSXSymbol,
    isFunction: false,
    isAsync: true,
    type: {}, // You can specify additional options here if needed
    f: async (ctx) => {
      const currentName = ctx.currentName(symbolRenderFileJSX);
      const currentPetition = ctx.getPetition();
      const globalOptions = ctx.getGlobalOptions();

      if (
        typeof globalOptions.cyclePlugin[symbolRenderFileJSX] !== "object"
      ) {
        throw new Error(
          "This plugin was designed to work with this app. Open a PR if you need a custom one.",
        );
      }

      // Retrieve options from Global Options
      const optionsFromGO = globalOptions.cyclePlugin[symbolRenderFileJSX];
      const componentPath = optionsFromGO.path as string;

      // Retrieve options from the current petition
      const currentOptions =
        ctx.getOptionsFromPetition(currentPetition)(currentName) ?? {};

      // Dynamically import the JSX component
      const modulePath = path.join(root, componentPath);
      const componentModule = await import(modulePath);
      const Component = componentModule.default;

      // Create a React element and render it to HTML
      const element = createElement(Component);
      const html = ReactDOMServer.renderToString(element);

      return () => html;
    },
  });
};

/**
 * Plugin to serve JSX files using Vixeny petitions.
 */

export const jsxStaticServePlugin = (arg: {
  petitions: typeof Vixeny.petitions;
  React: ReactUsedType;
  ReactDOMServer: typeof ReactDOMServer;
  root: string;
  plugins: pluginType;
}) => {
  const { React: { createElement }, ReactDOMServer, root, plugins, petitions } =
    arg;

  return petitions.sealableAdd({
    cyclePlugin: {
      renderJSX: renderFileJSX({
        createElement,
        ReactDOMServer,
        root,
        plugins,
      }),
      defaultJSX: defaultFileJSX({
        createElement,
        ReactDOMServer,
        root,
        plugins,
      }),
    },
  });
};

/**
 * Plugin to handle serving static JSX files.
 */
export const jsxStaticServerPlugin = ({
  plugins,
  options,
}: {
  plugins: typeof Vixeny.plugins;
  options: StaticServer;
}) => {
  return plugins.staticFilePlugin({
    type: "add",
    checker: (ctx) => ctx.path.endsWith(".jsx"),
    p: (file) => ({
      ...options.petition,
      // Lazy loading by default
      lazy: true,
      // Safely passing the context to the plugin
      o: {
        ...options.petition.o ?? {},
        cyclePlugin: {
          ...options.petition.o?.cyclePlugin,
          [defaultFileJSXSymbol]: file,
          [symbolRenderFileJSX]: file,
        },
      },
      // Determine the router path
      path: options &&
          "preserveExtension" in options &&
          !options.preserveExtension
        ? file.relativeName.slice(0, -4) // Remove the '.jsx' extension
        : file.relativeName,
    }),
  });
};
