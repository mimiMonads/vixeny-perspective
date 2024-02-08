import { CyclePlugin, FunRouterOptions } from "vixeny/components/http/types";
import { compileFile } from "pug";
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
type CompileClientFunctionString = string;

// For compileClientWithDependenciesTracked
interface CompileClientWithDependenciesTrackedResult {
  body: string; // The function body as a string
  dependencies: string[]; // Array of dependencies filenames
}

// export function compile(source: string, options?: Options): CompileFunction;
// export function compileFile(path: string, options?: Options): CompileFunction;
// export function compileClient(source: string, options?: Options): CompileClientFunctionString;
// export function compileClientWithDependenciesTracked(source: string, options?: Options): CompileClientWithDependenciesTrackedResult;
// export function compileFileClient(path: string, options?: Options): CompileClientFunctionString;
// export function render(source: string, options?: Options): string;
// export function renderFile(path: string, options?: Options): string;


//posible types ins pug
type plugin =
    // | "compile"
     | "compileFile"
    // | "compileClient"
    // | "compileClientWithDependenciesTracked"
    // | "compileFileClient"
    // | "renderFile"
    // | "render"
;
// Creating a plugin for rendering Pug templates
const pugRenderer = (needs:plugin) => {
  const sym = Symbol("pugRenderer");

  return {
    name: sym,
    isFunction: true,
    type: {} as {path: string, options?: Options},
    // This plugin does not have a specific type requirement
    f: (o:FunRouterOptions) => (userOptions:Petition) =>{

    //getting name
    const currentName = Object
    .keys(o?.cyclePlugin ?? [])
    //@ts-ignore
    .find(name => o?.cyclePlugin[name].name === sym) as string;

    const options =  
        "plugins" in userOptions && userOptions.plugins
          ? userOptions.plugins[currentName] as {path: string, options?: Options}
          : null


    if (options === null || options === undefined ) throw new Error('Expecting path in: ' + currentName)

    try{
      const compose = compileFile(options.path,options.options)
      return  compose as CompileFunction
    }catch(e){
      throw new Error("The pluging : " + currentName + ' has panicked in : '+ userOptions.path )
    } 

    }
  };
};

// Self-invoking function to enforce type-checking against the CyclePlugin type.
((I: CyclePlugin) => I)(pugRenderer("compileFile"));

export default pugRenderer;
