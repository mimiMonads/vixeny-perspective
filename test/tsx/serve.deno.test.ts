import { vixeny  } from "vixeny";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { tsxStaticServer } from "../../src/tsx/staticServe.ts";

import * as Dom from "react-dom/server";
import * as React from "react";
import * as esbuild from "esbuild";



const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/tsx",
    template: [
        //@ts-ignore
        tsxStaticServer(Dom)(React)(esbuild)()
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
