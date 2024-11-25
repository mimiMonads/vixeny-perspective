import { petitions, plugins, vixeny, wrap } from "vixeny";
import { describe, expect, it } from "bun:test";
import { pugStaticServerPlugin, pugToPetition } from "../../main.ts";
import { compileFile } from "pug";

// Create the plugin
const plugin = pugToPetition({
  petitions,
  compileFile,
  plugins,
});

const petition = plugin({})({
  f: ({
    renderPug,
    defaultPug,
  }) => new Response(renderPug()),
});

const serve = await vixeny()([
  ...wrap()()
    .get({
      path: "/",
      f: () => "huh",
    })
    .unwrap(),
  {
    type: "fileServer",
    name: "/",
    path: "./public/pug/",
    template: [
      pugStaticServerPlugin({
        plugins,
        options: {
          petition,
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

    // expect(
    //   header["content-type"],
    // )
    //   .toBe(
    //     "text/html",
    //   );
  });
});
