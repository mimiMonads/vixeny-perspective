import { petitions, plugins, vixeny } from "vixeny";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { typescriptStaticServer } from "../../src/typescript/staticServe.ts";

import * as esbuild from "esbuild";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/typescript",
    template: [
      typescriptStaticServer({
        plugins,
        esbuild,
        petitions,
      }),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

//TODO : Addd test

//Deno is making it really hard to test , good luck !

// Deno.test("compile", async () => {
//   const response =
//   (await serve(new Request("http://localhost:8080/hello.mjs")))

//   const text = await Promise.resolve(response.text());

//   assertEquals(
//     text === `// test/typescript/hello.ts\nvar test = () => console.log("Hello");\n\n// public/typescript/hello.ts\ntest();\n`,
//     true
//   );
// });
