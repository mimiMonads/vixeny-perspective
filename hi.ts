// import { compile, preprocess } from "svelte/compiler";

// console.log(
//   compile("./test.svelte", {
//     generate: "dom",
//   }).js.code,
// );


import esbuild from 'esbuild';
import {cwd} from 'node:process'
import fs from 'node:fs/promises';
import path from 'node:path';


const compileToESM = async (code: string) => {
  const result = await esbuild.build({
    stdin: {
      contents: code,
      resolveDir: cwd(),
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    target: 'es2015',
    platform: 'browser', 
    format: 'esm',
    external: ['react', 'react-dom'],
  });
  return result.outputFiles[0].text;
};


const createDataURL = (code: string) => {
  const encodedCode = encodeURIComponent(code);
  return `data:text/javascript;charset=utf-8,${encodedCode}`;
};

const rendering = async (code: string) => {
  const compiledCode = await compileToESM(code);
  const dataURL = createDataURL(compiledCode);
  const module = await import(/* webpackIgnore: true */ dataURL);
  return module.default;
};




const loadFileForRenderESM = async (filePath: string) => {
  try {

    const code = await fs.readFile(path.resolve(filePath), 'utf8');

    const renderedModule =  await rendering(code);
    return renderedModule;
  } catch (error) {
    console.error(`Error loading file for renderESM: ${error}`);
    throw error;
  }
};



(async () => {
  console.log(
     await loadFileForRenderESM('./main.tsx')
  );
})();
