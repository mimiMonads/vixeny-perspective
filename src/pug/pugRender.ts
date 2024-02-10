import { CyclePlugin, FunRouterOptions } from "vixeny/components/http/types";
import {
  compile,
  compileClient,
  compileClientWithDependenciesTracked,
  compileFile,
  compileFileClient,
  compileTemplate,
  Options as PugOptions,
  render as pugRender,
  renderFile as pugRenderFile,
} from "pug";
import { Petition } from "vixeny/components/http/src/framework/optimizer/types";

// Returns a string representing a function for client-side use

// not implemented
// For compileClientWithDependenciesTracked
interface CompileClientWithDependenciesTrackedResult {
  body: string; // The function body as a string
  dependencies: string[]; // Array of dependencies filenames
}

// export function render(source: string, options?: Options): string;
// export function renderFile(path: string, options?: Options): string;

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

export const composeCompiled = ((sym) => ({
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
      const compose = compile(options.source, options.options);
      return compose as compileTemplate;
    } catch (e) {
      throw new Error(
        "The pluging : " + currentName + " has panicked in : " +
          userOptions.path,
      );
    }
  },
}))(Symbol("composeCompiled"));

export const composeCompiledFile = ((sym) => ({
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
      const compose = compileFile(options.path, options.options);
      return compose as compileTemplate;
    } catch (e) {
      throw new Error(
        "The pluging : " + currentName + " has panicked in : " +
          userOptions.path,
      );
    }
  },
}))(Symbol("composeCompiledFile"));

export const composecompiledClient = ((sym) => ({
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
        return composed as CompileClientWithDependenciesTrackedResult;
      } catch (e) {
        throw new Error(
          "The pluging : " + currentName + " has panicked in : " +
            userOptions.path,
        );
      }
    },
  })
)(Symbol("compileClientWithDependenciesTracked"));

export const composeCompiledFileClient = ((sym) => ({
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

export const render = {
  name: Symbol.for("render"),
  isFunction: true,
  type: undefined,
  f: (_: FunRouterOptions) => (_: Petition) => pugRender,
};

export const renderFile = {
  name: Symbol.for("render"),
  isFunction: true,
  type: {},
  f: (_?: FunRouterOptions) => (_: Petition) => pugRenderFile,
};

// Self-invoking function to enforce type-checking against the CyclePlugin type.
((I: CyclePlugin) => I)(composeCompiled);
((I: CyclePlugin) => I)(composeCompiledFile);
((I: CyclePlugin) => I)(render);
((I: CyclePlugin) => I)(renderFile);
