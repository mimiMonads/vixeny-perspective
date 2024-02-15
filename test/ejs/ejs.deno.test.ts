import { wrap } from "vixeny";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { ejsOptions } from "./optionsEjs.ts";

const routes = wrap(ejsOptions)()
  .stdPetition({
    path: "/compile",
    plugins: {
      compile: {
        template: "Hello <%= user.name %>!",
      },
    },
    f: (c) => c.compile({ user: { name: "John" } }),
  });

const test = routes.testRequests();

Deno.test("compile: validPath", async () => {
  const response = await test(new Request("http://localhost:8080/compile"));
  const text = await response.text();
  assertEquals(text, "<p>helloworld's Pug source code!</p>");
});
