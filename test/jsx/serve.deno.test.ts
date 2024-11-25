import { petitions, plugins, vixeny } from "vixeny";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  jsxStaticServerPlugin,
  jsxToPetition,
} from "../../src/jsx/staticServe.ts";

import * as React from "https://esm.sh/react";
import * as ReactDOMServer from "react-dom/server";

// Simulating process.cwd() for Deno
const root = Deno.cwd();

const plugin = jsxToPetition({
  ReactDOMServer,
  React,
  root,
  petitions,
  plugins,
});

const petition = plugin()({
  f: ({ renderJSX, defaultJSX, query }: any) => {
    if (query && query.message) {
      return renderJSX(query);
    } else {
      return defaultJSX;
    }
  },
});

const serve = await vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/jsx",
    template: [
      jsxStaticServerPlugin({
        plugins,
        options: {
          root,
          preserveExtension: false,
          petition,
        },
      }),
    ],
  },
]);

const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

Deno.test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/main"));
  const responseWithQuery = await serve(
    new Request("http://localhost:8080/main?message=hi"),
  );

  const text = normalize(await response.text());
  const customText = normalize(await responseWithQuery.text());

  assertEquals(
    text,
    normalize(
      `<div>Hello, world!</div>`,
    ),
  );

  assertEquals(
    customText,
    normalize(
      `<div>hi</div>`,
    ),
  );
});
