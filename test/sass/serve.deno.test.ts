import { petitions, plugins, vixeny } from "vixeny";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { sassStaticServer } from "../../main.ts";
import * as sass from "sass";

const serve = await vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/sass",
    template: [
      sassStaticServer({
        sass,
        plugins,
        petitions,
      }),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

Deno.test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/style.css"));
  const text = normalize(await response.text());
  assertEquals(
    text,
    normalize("h1 { font-size: 40px; } h1 code { font-face: Roboto Mono; }"),
  );
});
