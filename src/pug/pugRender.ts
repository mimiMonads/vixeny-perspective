import { FunRouterOptions, Petition } from "vixeny/types";

import * as pugModule from "pug";

type PugOptions = pugModule.Options;
type SourceType = { source: string; options?: PugOptions } | null | undefined;
type PathType = { path: string; options?: PugOptions } | null | undefined;

const getName = (o: FunRouterOptions) => (sym: symbol) =>
  Object
    .keys(o?.cyclePlugin ?? [])
    //@ts-ignore
    .find((name) => o?.cyclePlugin[name].name === sym) as string;

const getOptions = (userOptions: Petition) => (currentName: string) =>
  "plugins" in userOptions && userOptions.plugins
    ? userOptions.plugins[currentName]
    : null;

export const composeCompiled = (compile: typeof pugModule.compileFile) =>
  ((sym) => ({
    name: sym,
    isFunction: true,
    type: {} as SourceType,
    // This plugin does not have a specific type requirement
    f: (o: FunRouterOptions) => (userOptions: Petition) => {
      //getting name
      const currentName = getName(o)(sym);

      const options = getOptions(userOptions)(currentName) as SourceType;

      if (options === null || options === undefined) {
        throw new Error("Expecting source in: " + currentName);
      }

      try {
        return compile(options.source, options.options);
      } catch (e) {
        throw new Error(
          "The pluging : " + currentName + " has panicked in : " +
            userOptions.path,
        );
      }
    },
  }))(Symbol("composeCompiled"));

export const composeCompiledFile = (
  compileFile: typeof pugModule.compileFile,
) =>
  ((sym) => ({
    name: sym,
    isFunction: true,
    type: {} as PathType,
    // This plugin does not have a specific type requirement
    f: (o: FunRouterOptions) => (userOptions: Petition) => {
      //getting name
      const currentName = getName(o)(sym);

      const options = getOptions(userOptions)(currentName) as PathType;

      if (options === null || options === undefined) {
        throw new Error("Expecting path in: " + currentName);
      }

      try {
        return compileFile(options.path, options.options);
      } catch (e) {
        throw new Error(
          "The pluging : " + currentName + " has panicked in : " +
            userOptions.path,
        );
      }
    },
  }))(Symbol("composeCompiledFile"));

export const composecompiledClient = (
  compileClient: typeof pugModule.compileClient,
) =>
  ((sym) => ({
    name: sym,
    isFunction: true,
    type: {} as SourceType,
    // This plugin does not have a specific type requirement
    f: (o: FunRouterOptions) => (userOptions: Petition) => {
      //getting name
      const currentName = getName(o)(sym);

      const options = getOptions(userOptions)(currentName) as SourceType;

      if (options === null || options === undefined) {
        throw new Error("Expecting path in: " + currentName);
      }

      try {
        const composed = compileClient(
          options.source,
          options.options,
        ) as string;
        return composed;
      } catch (e) {
        throw new Error(
          "The pluging : " + currentName + " has panicked in : " +
            userOptions.path,
        );
      }
    },
  }))(Symbol("composecompiledClient"));

export const composeCompiledClientWithDependenciesTracked = (
  compileClientWithDependenciesTracked:
    typeof pugModule.compileClientWithDependenciesTracked,
) =>
  (
    (sym) => ({
      name: sym,
      isFunction: true,
      type: {} as SourceType,
      // This plugin does not have a specific type requirement
      f: (o: FunRouterOptions) => (userOptions: Petition) => {
        //getting name
        const currentName = getName(o)(sym);

        const options = getOptions(userOptions)(currentName) as SourceType;

        if (options === null || options === undefined) {
          throw new Error("Expecting path in: " + currentName);
        }

        try {
          const composed = compileClientWithDependenciesTracked(
            options.source,
            options.options,
          );
          return composed;
        } catch (e) {
          throw new Error(
            "The pluging : " + currentName + " has panicked in : " +
              userOptions.path,
          );
        }
      },
    })
  )(Symbol("compileClientWithDependenciesTracked"));

export const composeCompiledFileClient = (
  compileFileClient: typeof pugModule.compileFileClient,
) =>
  ((sym) => ({
    name: sym,
    isFunction: true,
    type: {} as PathType,
    // This plugin does not have a specific type requirement
    f: (o: FunRouterOptions) => (userOptions: Petition) => {
      //getting name
      const currentName = getName(o)(sym);

      const options = getOptions(userOptions)(currentName) as PathType;

      if (options === null || options === undefined) {
        throw new Error("Expecting path in: " + currentName);
      }

      try {
        const composed = compileFileClient(
          options.path,
          options.options,
        ) as string;
        return composed;
      } catch (e) {
        throw new Error(
          "The pluging : " + currentName + " has panicked in : " +
            userOptions.path,
        );
      }
    },
  }))(Symbol("composeCompiledFileClient"));

export const render = (pugRender: typeof pugModule.render) => ({
  name: Symbol.for("render"),
  isFunction: true,
  type: undefined,
  f: (_: FunRouterOptions) => (_: Petition) => pugRender,
});

export const renderFile = (renderFile: typeof pugModule.render) => ({
  name: Symbol.for("render"),
  isFunction: true,
  type: {},
  f: (_?: FunRouterOptions) => (_: Petition) => renderFile,
});
