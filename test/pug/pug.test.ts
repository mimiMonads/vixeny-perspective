import { wrap } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import pugOptions from "../../src/pug/optionsPug";

const routes = wrap(pugOptions)()
  .stdPetition({
    path: "/",
    plugins:{
      compileFile:{
        path: "./src/pug/template.pug"
      }
    },
    f: (c) => c.compileFile({ name: "helloworld" }),
  })

const test = routes.testRequests();

describe("compileFile", () => {
  it("validPath", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/"),
      ).then((res) => res.text()),
    )
      .toBe("<p>helloworld's Pug source code!</p>"));

    it("inValidPath", async () =>
      expect(
        routes.stdPetition({
          path: "/throw",
          plugins:{
            compileFile:{
              path: "./src/pug/template.pug"
            }
          },
          f: (c) => c.compileFile({ name: "helloworld" }),
        }).testRequests()
      )
      .toThrow()
      )
      it("inValidPath", async () =>
      expect(
        routes.stdPetition({
          path: "/throw",
          plugins:{
            compileFile:{
              path: "./src/pug/template.pug"
            }
          },
          f: (c) => c.compileFile({ name: "helloworld" }),
        }).testRequests()
      )
      .toThrowError()
      )
});
