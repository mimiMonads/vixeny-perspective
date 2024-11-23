// import { compile, preprocess } from "svelte/compiler";

// console.log(
//   compile("./test.svelte", {
//     generate: "dom",
//   }).js.code,
// );

import type * as esbuild from "esbuild";
import  * as otherValue from "esbuild";
import { cwd } from "node:process";
import fs from "node:fs/promises";
import path from "node:path";

type FromEsBuild = {
  code : string;
  es : typeof esbuild
}

const compileToESM = async ( args : FromEsBuild) => {
const {es , code} = args
  const result = await es.build({
    stdin: {
      contents: code,
      resolveDir: cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    target: "es2015",
    platform: "browser",
    format: "esm",
    external: ["react", "react-dom"],
  });
  return result.outputFiles[0].text;
};

const createDataURL = (code: string) => {
  const encodedCode = encodeURIComponent(code);
  return `data:text/javascript;charset=utf-8,${encodedCode}`;
};

const rendering = async (arg: FromEsBuild) => {
  const compiledCode = await compileToESM(arg);
  const dataURL = createDataURL(compiledCode);
  const module = await import(/* webpackIgnore: true */ dataURL);
  return module.default;
};

const loadFileForRenderESM = async (args :{filePath: string , es: typeof esbuild , cwd?: string}) => {
  const { filePath , es } = args
  try {
    const code = await fs.readFile(path.resolve(args.cwd ?? '' ,filePath), "utf8");

    const renderedModule = await import(filePath);
    return renderedModule;
  } catch (error) {
    console.error(`Error loading file for renderESM: ${error}`);
    throw error;
  }
};

(async () => {
  console.log(
    await loadFileForRenderESM({
      filePath: "./public/tsx/main.tsx",
      es: otherValue
    }),
  );
})();
