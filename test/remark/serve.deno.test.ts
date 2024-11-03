import { petitions, plugins, vixeny } from "vixeny";
import { type PluginTuple, unified } from "unified";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { remarkStaticServer } from "../../src/remark/staticServer.ts";

import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

const pro = unified()
  .use(remarkParse as unknown as PluginTuple)
  .use(remarkRehype)
  .use(rehypeDocument, { title: "👋🌍" })
  .use(rehypeFormat)
  .use(rehypeStringify as unknown as PluginTuple);

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/remark",
    template: [
      remarkStaticServer({
        unified,
        plugins,
        petitions,
        options: {
          uses: [
            [remarkParse] as PluginTuple,
            [remarkRehype] as unknown as PluginTuple,
            [rehypeDocument, { title: "👋🌍" }] as unknown as PluginTuple,
            [rehypeFormat] as unknown as PluginTuple,
            [rehypeStringify] as unknown as PluginTuple,
            [remarkRehype] as unknown as PluginTuple,
          ],
        },
      }),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

Deno.test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/hello.md"));
  const text = normalize(await response.text());
  assertEquals(text, normalize(String(await pro.process("# Hello world!"))));
});
