import { wrap } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import pugOptions from "../../src/pug/optionsPug";

const test = wrap(pugOptions)()
  .stdPetition({
    path: "/",
    f: (c) => c.compileFile("./src/pug/template.pug")({ name: "helloworld" }),
  }).testRequests();

describe("dd", () => {
  it("hest", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/"),
      ).then((res) => res.text()),
    )
      .toBe("<p>helloworld's Pug source code!</p>"));
});
