import { composer, petitions, plugins, vixeny } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import { pugStaticServerPlugin } from "../../src/pug/staticServer.ts";
import { compileFile } from "pug";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/",
    template: [
      pugStaticServerPlugin({
        compileFile,
        plugins,
        petitions,
      }),
    ],
  },
]);

const serve2 = vixeny({
  cors: {
    allowOrigins: "*",
  },
})([
  {
    type: "fileServer",
    name: "/",
    path: "./public/",
    template: [
      pugStaticServerPlugin({
        compileFile,
        plugins,
        petitions,
        option: {
          globalF: composer.objectNullRequest()({
            f: () => ({ name: "Chole" }),
          }),
        },
      }),
    ],
  },
]);

describe("compile", async () => {
  it("validPathWithPetition", async () => {
    const response = await Promise.resolve(serve(
      new Request("http://localhost:8000/main.pug"),
    ));

    const text = await response.text();
    const header = response.headers.toJSON();

    expect(
      text,
    )
      .toBe("<p>'s Pug source code!</p>");

    expect(
      header["content-type"],
    )
      .toBe(
        "text/html",
      );
  });
});

describe("compile", async () => {
  it("validPathWithPetition", async () => {
    const response = await Promise.resolve(serve2(
      new Request("http://localhost:8000/main.pug"),
    ));

    const text = await response.text();
    const header = response.headers.toJSON();

    expect(
      text,
    )
      .toBe("<p>Chole's Pug source code!</p>");

    expect(
      header["content-type"],
    )
      .toBe(
        "text/html",
      );

    expect(
      header["access-control-allow-origin"],
    )
      .toBe(
        "*",
      );
  });
});
