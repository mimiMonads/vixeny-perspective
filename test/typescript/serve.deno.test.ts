import { vixeny } from "vixeny";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { typescriptStaticServer } from "../../src/typescript/staticServe.ts";
import esm from "esbuild";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/typescript",
    template: [
        typescriptStaticServer(esm)(),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

Deno.test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/hello.mjs"));

  const text = normalize(await response.text());
  assertEquals(text,normalize('// test/typescript/hello.ts var test = () => console.log( ); // public/typescript/hello.ts test(); '));
});
