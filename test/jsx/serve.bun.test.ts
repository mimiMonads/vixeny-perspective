import { vixeny } from "vixeny";
import { jsxStaticServer } from "../../src/jsx/staticServe.ts";

import * as Dom from "react-dom/server";
import * as React from "react";

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/jsx",
    template: [
      jsxStaticServer(Dom)(React)({
        root: process.cwd(),
      }),
    ],
  },
]);
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");


  const response = await serve(new Request("http://localhost:8080/main"));

  const text = normalize(await response.text());

console.log(text)