import { petitions, plugins, vixeny } from "vixeny";
import { jsxStaticServerPlugin, jsxToPetition } from "../../main.ts";
import { expect, test } from "bun:test";
import process from "node:process";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";

const plugin = jsxToPetition({
  ReactDOMServer,
  React,
  root: process.cwd(),
  petitions,
  plugins,
});

const petition = plugin()({
  f: ({ renderJSX, defaultJSX, query }) => {
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
          root: process.cwd(),
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

test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/main"));
  const responseWithQuery = await serve(
    new Request("http://localhost:8080/main?message=hi"),
  );

  const text = normalize(await response.text());
  const constumeText = normalize(await responseWithQuery.text());

  expect(
    text,
  ).toBe(
    normalize(
      `<div>Hello, world!</div>`,
    ),
  );

  expect(
    constumeText,
  ).toBe(
    normalize(
      `<div>hi</div>`,
    ),
  );
});
