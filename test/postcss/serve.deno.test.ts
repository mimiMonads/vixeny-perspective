import { vixeny } from "vixeny";
import postcssNested from "postcss-nested";
import autoprefixer from "autoprefixer";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { postcssStaticServer } from "../../src/postcss/staticServer.ts";
import postcss from "postcss";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/postcss",
    template: [
      postcssStaticServer(postcss)(
        {
          uses: [
            autoprefixer,
            postcssNested,
          ] as (postcss.AcceptedPlugin)[],
        },
      ),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

Deno.test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/main.css"));
  const text = normalize(await response.text());
  assertEquals(
    text,
    normalize(
      "/* Input CSS (styles.css) */ :root { --main-color: #123456; } .body { font-family: , sans-serif; color: var(--main-color); } .body .header { background: var(--main-color); } .body .header__title { margin: 0; color: #ffffff; } ",
    ),
  );
});
