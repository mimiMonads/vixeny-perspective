import { petitions, plugins, vixeny } from "vixeny";
import { expect, test } from "bun:test";
import { typescriptStaticServer } from "../../main.ts";

import * as esbuild from "esbuild";

const serve = await vixeny()([
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

const normalize = (s) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/hello.mjs"));
  const text = await response.text();
  expect(
    text ===
      `// test/typescript/hello.ts
var test = () => console.log("Hello");

// public/typescript/hello.ts
test();
`,
  ).toBe(true);
});
