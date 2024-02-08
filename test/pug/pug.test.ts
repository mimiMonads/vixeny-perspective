import { wrap } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import pugOptions from "../../src/pug/optionsPug";

const routes = wrap(pugOptions)()
  .stdPetition({
    path: "/compileFile",
    plugins:{
      compileFile:{
        path: "./src/pug/template.pug"
      }
    },
    f: (c) => c.compileFile({ name: "helloworld" }),
  })
  .stdPetition({
    path: "/compile",
    plugins:{
      compile:{
        source: `p #{name}'s Pug source code!`
      }
    },
    f: (c) => c.compile({ name: "helloworld" }),
  })
const test = routes.testRequests();

describe("compile", () => {
  it("validPath", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/compile"),
      ).then((res) => res.text()),
    )
      .toBe("<p>helloworld's Pug source code!</p>"));

    it("inSource", async () =>
      expect(
        routes.stdPetition({
          path: "/throw",
          plugins:{
            compile:{
              source: null
            }
          },
          f: (c) => c.compile({ name: "helloworld" }),
        }).testRequests()
      )
      .toThrow()
      )
      it("noSource", async () =>
      expect(
        routes.stdPetition({
          path: "/throw",
          plugins:{
            compile:{
            }
          },
          f: (c) => c.compile({ name: "helloworld" }),
        }).testRequests()
      )
      .toThrowError()
      )
});


describe("compileFile", () => {
  it("validPath", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/compileFile"),
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
});
