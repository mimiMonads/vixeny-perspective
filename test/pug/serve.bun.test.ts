import { composer, vixeny } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import { pugStaticServerPlugin } from "../../src/pug/staticServer.ts";
import * as pugModule from "pug";
import { plugins } from "vixeny";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/",
    template: [pugStaticServerPlugin(pugModule.compileFile)()],
  },
]);

const serve2 = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/",
    template: [
      pugStaticServerPlugin(pugModule.compileFile)({
        petition: composer.objectNullRequest()({
          f: () => ({ name: "Dave" }),
        }),
      }),
    ],
  },
]);

describe("compile", async () => {
  it("validPath", async () =>
    expect(
      await Promise.resolve(serve(
        new Request("http://localhost:8000/main.pug"),
      ))
        .then((res) => res.text()),
    )
      .toBe("<p>'s Pug source code!</p>"));
});

describe("compile", async () => {
  it("validPathWithPetition", async () =>
    expect(
      await Promise.resolve(serve2(
        new Request("http://localhost:8000/main.pug"),
      ))
        .then((res) => res.text()),
    )
      .toBe("<p>Dave's Pug source code!</p>"));
});
