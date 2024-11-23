import { petitions, plugins, vixeny } from "vixeny";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { tsxStaticServerPlugin , tsxStaticServePlugin } from "../../src/tsx/staticServe.ts";

import * as ReactDOMServer from "react-dom/server";
import * as React from "react";

const plugin = tsxStaticServePlugin({
  petitions,
  React,
  ReactDOMServer,
  plugins,
  root: Deno.cwd()
})

const petition = plugin()({
  f: ({ defaultTSX }) => defaultTSX
})

const serve = await vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/tsx",
    template: [

      tsxStaticServerPlugin({
        plugins,
        options: {
          petition,
          root: '',
          preserveExtension: false
        },
      }),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

// TODO : Addd test

// Deno is making it really hard to test , good luck !

console.log(
  await (await serve(new Request("http://localhost:8080/main"))).text(),
);
// console.log( await(await serve(new Request("http://localhost:8080/main"))).text())
// console.log( await(await serve(new Request("http://localhost:8080/main"))).text())
// console.log( await(await serve(new Request("http://localhost:8080/main"))).text())
// console.log( await(await serve(new Request("http://localhost:8080/main"))).text())
// Deno.test("compile", async () => {
//   const response = await serve(new Request("http://localhost:8080/main"));
//   const text = normalize(await response.text());
//   assertEquals(
//     text,
//     "<div><h1>Welcome to my app</h1><button disabled= >I&#x27;m a disabled button</button></div>",
//   );
// });
