import * as esbuild from "esbuild";
import type * as React from "react";
import type * as Dom from "react-dom/server";
import type * as Vixeny from "vixeny";

type Petition = ReturnType<ReturnType<typeof Vixeny.petitions.common>>;

type petitionType = (r: Request) => Record<string, unknown> | null;

type StaticServer = {
  preserveExtension?: boolean;
  default?: Record<string, unknown>;
  thisGlobalOptions?: ReturnType<typeof Vixeny.plugins.globalOptions>;
  globalF?: petitionType;
  f?: Petition;
};


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

const renderingFile = async (code: string) => {
  const compiledCode = await compileToESM(code);
  const dataURL = createDataURL(compiledCode);
  const module = await import(/* webpackIgnore: true */ dataURL);
  return module.default;
};




const loadFileForRenderESM = async (filePath: string) => {
  try {

    const code = await fs.readFile(path.resolve(filePath), 'utf8');

    const renderedModule =  await renderingFile(code);
    return renderedModule;
  } catch (error) {
    console.error(`Error loading file for renderESM: ${error}`);
    throw error;
  }
};


const renderComponentFromTSX = (esm: typeof esbuild) => async (path: string) =>
  new TextDecoder("utf-8").decode(
    (await esm.build({
      entryPoints: [path],
      bundle: true,
      write: false,
      platform: "browser",
      format: "cjs",
      loader: { ".tsx": "tsx", ".jsx": "jsx" },
    })).outputFiles[0].contents,
  );

const rendering =
  (esm: typeof esbuild) =>
  (ReactModule: typeof React) =>
  async (path: string) =>
    new Function(
      "React",
      "module",
      `${await renderComponentFromTSX(esm)(
        path,
      )}; return module.exports;`,
    )(ReactModule, { exports: {} }).default;

const onPetition =
  (esm: typeof esbuild) =>
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (f: petitionType) =>
  (path: string) =>
    ((element: any) =>
    (component: any) =>
    (def: string | null) =>
    async (headers: Record<string, string>) =>
      def === null
        ? new Response(
          def = DomModule.renderToString(
            component = ReactModule.createElement(
              element = await rendering(esm)(ReactModule)(path),
            ),
          ),
          {
            headers: headers,
          },
        )
        : new Response(
          def,
          {
            headers: headers,
          },
        ))(null)(null)(null);

const onProduction =
  (esm: typeof esbuild) =>
  (DomModule: typeof Dom) =>
  (ReactModule: typeof React) =>
  (path: string) =>
    ((element: any) =>
    (component: any) =>
    (def: string | null) =>
    async (headers: Record<string, string>) =>
      def === null
        ? new Response(
          def = DomModule.renderToString(
            component = ReactModule.createElement(
              element = await rendering(esm)(ReactModule)(path),
            ),
          ),
          {
            headers: headers,
          },
        )
        : new Response(
          def,
          {
            headers: headers,
          },
        ))(null)(null)(null);

export const tsxStaticServer = (args: {
  Dom: typeof Dom;
  React: typeof React;
  esbuild: typeof esbuild;
  options: StaticServer;
  plugins: typeof Vixeny.plugins;
  petitions: typeof Vixeny.petitions;
}) => {
  const { Dom, React, esbuild, options, petitions, plugins } = args;
  return plugins.staticFilePlugin(
    {
      checker: (ctx) => ctx.path.endsWith(".tsx"),
      p: (ob) =>
        petitions.custom(options?.thisGlobalOptions)({
          path: ob.relativeName.slice(0, -4),
          // Headings
          headings: {
            headers: ".html",
          },
          // Only
          options: {
            only: ["headers"],
          },
          f: ((fun) => ({ headers }) => fun(headers))(
            onProduction(esbuild)(Dom)(React)(ob.path),
          ),
        }),
    },
  );
};
