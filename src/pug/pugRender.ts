import { CyclePlugin, FunRouterOptions } from "vixeny/components/http/types";
import {
  compile,
  compileClient,
  compileClientWithDependenciesTracked,
  compileFile,
  compileFileClient,
  render as pugRender,
  renderFile as pugRenderFile,
} from "pug";
import { Petition } from "vixeny/components/http/src/framework/optimizer/types";

interface Options {
  filename?: string; // The name of the file being compiled.
  basedir?: string; // The root directory of all absolute inclusion.
  doctype?: string; // Specifies the doctype of the template.
  pretty?: boolean | string; // [Deprecated] Whether to format the output HTML for readability.
  filters?: { [key: string]: Function }; // Custom filters for template transformations.
  self?: boolean; // Whether to use `self` namespace for locals.
  debug?: boolean; // Enables logging of tokens and function body to stdout.
  compileDebug?: boolean; // Includes function source in compiled template for better error messages.
  globals?: string[]; // List of global names to make accessible in templates.
  cache?: boolean; // Enables caching of compiled functions.
  inlineRuntimeFunctions?: boolean; // Inlines runtime functions instead of requiring them from a shared version.
  name?: string; // The name of the template function (for `compileClient` functions).
}

interface CompileFunction {
  (locals?: { [key: string]: any }): string;
}

// Returns a string representing a function for client-side use

// not implemented
// For compileClientWithDependenciesTracked
interface CompileClientWithDependenciesTrackedResult {
  body: string; // The function body as a string
  dependencies: string[]; // Array of dependencies filenames
}

// export function render(source: string, options?: Options): string;
// export function renderFile(path: string, options?: Options): string;

type SourceType = { source: string; options?: Options } | null | undefined;
type PathType = { path: string; options?: Options } | null | undefined;

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
      return compose as CompileFunction;
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
      return compose as CompileFunction;
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
  f: (_:FunRouterOptions) => (_:Petition) => pugRender as (source: string, options?: Options) => string,
};

export const renderFile = {
  name: Symbol.for("render"),
  isFunction: true,
  type: {} ,
  f: (_?:FunRouterOptions) => (_:Petition) => pugRenderFile as (path: string, options?: Options) => string,
};

// Self-invoking function to enforce type-checking against the CyclePlugin type.
((I: CyclePlugin) => I)(composeCompiled);
((I: CyclePlugin) => I)(composeCompiledFile);
((I: CyclePlugin) => I)(render);
((I: CyclePlugin) => I)(renderFile);
