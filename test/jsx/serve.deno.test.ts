import { petitions, plugins, vixeny } from "vixeny";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { jsxStaticServer } from "../../src/jsx/staticServe.ts";
import process from "node:process";
import * as Dom from "react-dom/server";
import * as React from "react";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/jsx",
    template: [
      jsxStaticServer({
        React,
        Dom,
        petitions,
        plugins,
        options: {
          root: process.cwd(),
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

  const text = normalize(await response.text());
  assertEquals(text, "<div>Hello, world!</div>");
});
