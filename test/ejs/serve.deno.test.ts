import { vixeny } from "vixeny";
import { ejsStaticServerPlugin } from "../../src/ejs/staticServer.ts";
import * as ejsModule from "ejs";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/",
    template: ejsStaticServerPlugin(ejsModule.renderFile)(),
  },
]);



Deno.test("compile", async () => {
    const response = await serve(new Request("http://localhost:8080/ejs/main.ejs"));
    const text = normalize( await response.text());
    assertEquals(text, normalize(`<header>
    <nav>
        <a href="/" style="color: white; text-decoration: none; margin: 0 15px;">Home</a>
        <a href="/docs" style="color: white; text-decoration: none; margin: 0 15px;">Docs</a>
    </nav>
  </header>`));
  });
  