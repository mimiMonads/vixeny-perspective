import { wrap } from "vixeny";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { ejsOptions } from "./optionsEjs.ts";
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

const routes = wrap(ejsOptions)()
  .stdPetition({
    path: "/compile",
    plugins: {
      compile: {
        template: "Hello <%= user.name %>!",
      },
    },
    f: (c) => c.compile({ user: { name: "John" } }),
  })
  .stdPetition({
    path: "/renderFile",
    f: async (c) => await c.renderFile("./public/ejs/main.ejs"),
  });

const test = routes.testRequests();

Deno.test("compile: validPath", async () => {
  const response = await test(new Request("http://localhost:8080/compile"));
  const text = normalize(await response.text());
  assertEquals(text, "Hello John!");
});

Deno.test("compile: validPath", async () => {
  const response = await test(new Request("http://localhost:8080/renderFile"));
  const text = normalize(await response.text());
  assertEquals(
    text,
    normalize(`<header>
  <nav>
      <a href="/" style="color: white; text-decoration: none; margin: 0 15px;">Home</a>
      <a href="/docs" style="color: white; text-decoration: none; margin: 0 15px;">Docs</a>
  </nav>
</header>`),
  );
});
