import { compile, preprocess } from "svelte/compiler";

console.log(
  compile("./test.svelte", {
    generate: "dom",
  }).js.code,
);
