import { vixeny } from "vixeny";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { tsxStaticServer } from "../../src/tsx/staticServe.ts";
import esm from "esbuild";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/tsx",
    template: [
      tsxStaticServer(esm)(),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

// Deno.test("compile", async () => {
//   const response = await serve(new Request("http://localhost:8080/main"));

//   const text = normalize(await response.text());

//   assertEquals(text,'');

// });
