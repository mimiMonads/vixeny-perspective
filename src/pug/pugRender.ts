import { plugins } from "vixeny";

const {
  getName,
  getOptions,
  type
} = plugins;

import * as pugModule from "pug";

type PugOptions = pugModule.Options;
type SourceType = { source: string; options?: PugOptions } | null | undefined;
type PathType = { path: string; options?: PugOptions } | null | undefined;



export const composeCompiled = (compile: typeof pugModule.compileFile) =>
  ((sym) => type({
    name: sym,
    isFunction: true,
    type: {} as SourceType,
    // This plugin does not have a specific type requirement
    f: (o) => (userOptions) => {
      //getting name
      const currentName = getName(o ?? {})(sym);

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
  ((sym) => type({
    name: sym,
    isFunction: true,
    type: {} as PathType,
    // This plugin does not have a specific type requirement
    f: (o) => (userOptions) => {
      //getting name
      const currentName = getName(o ?? {})(sym);

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
  ((sym) => type({
    name: sym,
    isFunction: true,
    type: {} as SourceType,
    // This plugin does not have a specific type requirement
    f: (o) => (userOptions) => {
      //getting name
      const currentName = getName(o ?? {})(sym);

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
    (sym) => type({
      name: sym,
      isFunction: true,
      type: {} as SourceType,
      // This plugin does not have a specific type requirement
      f: (o) => (userOptions) => {
        //getting name
        const currentName = getName(o ?? {})(sym);

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
  ((sym) => type({
    name: sym,
    isFunction: true,
    type: {} as PathType,
    // This plugin does not have a specific type requirement
    f: (o) => (userOptions) => {
      //getting name
      const currentName = getName(o ?? {})(sym);

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

export const render = (pugRender: typeof pugModule.render) => type({
  name: Symbol.for("render"),
  isFunction: true,
  type: undefined,
  f: () => () => pugRender,
});

export const renderFile = (renderFile: typeof pugModule.render) => type({
  name: Symbol.for("render"),
  isFunction: true,
  type: {},
  f: () => () => renderFile,
});
