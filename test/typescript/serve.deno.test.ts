import { vixeny } from "vixeny";

import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { delay } from "https://deno.land/std@0.224.0/async/delay.ts";
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

// Deno.test("compile", async () => {
//   const response = (await serve(new Request("http://localhost:8080/hello.mjs")));
//   await delay(100);
//   const text = await Promise.resolve(response.text());

//   await delay(100);

//   assertEquals(
//     text === `// test/typescript/hello.ts\nvar test = () => console.log("Hello");\n\n// public/typescript/hello.ts\ntest();\n`,
//     true
//   );
// });
