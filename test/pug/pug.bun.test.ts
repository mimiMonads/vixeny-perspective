import { wrap } from "vixeny";
import { describe, expect, it } from "@jest/globals";
import pugOptions from "./optionsPug";

const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

const routes = wrap(pugOptions)()
  .stdPetition({
    path: "/compileFile",
    plugins: {
      compileFile: {
        path: "./src/pug/template.pug",
      },
    },
    f: (c) => c.compileFile({ name: "helloworld" }),
  })
  .stdPetition({
    path: "/compile",
    plugins: {
      compile: {
        source: `p #{name}'s Pug source code!`,
      },
    },
    f: (c) => c.compile({ name: "helloworld" }),
  })
  .stdPetition({
    path: "/compileClient",
    plugins: {
      compileClient: {
        source: `p #{name}'s Pug source code!`,
      },
    },
    f: (c) => c.compileClient,
  })
  .stdPetition({
    path: "/compileFileClient",
    plugins: {
      compileFileClient: {
        path: "./src/pug/template.pug",
      },
    },
    f: (c) => c.compileFileClient,
  })
  .stdPetition({
    path: "/render",
    f: (c) => c.render(`p #{name}'s Pug source code!`),
  })
  .stdPetition({
    path: "/renderFile",
    f: (c) => c.renderFile("./src/pug/template.pug"),
  });

const test = routes.testRequests();

describe("compile", () => {
  it("validPath", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/compile"),
      ).then((res) => res.text()),
    )
      .toBe("<p>helloworld's Pug source code!</p>"));
});

describe("render", () => {
  it("validPath", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/render"),
      ).then((res) => res.text()),
    )
      .toBe("<p>'s Pug source code!</p>"));
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
        plugins: {
          compileFile: {
            path: "./src/pug/template.pug",
          },
        },
        f: (c) => c.compileFile({ name: "helloworld" }),
      }).testRequests(),
    )
      .toThrow());
});

describe("renderFile", () => {
  it("validPath", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/renderFile"),
      ).then((res) => res.text()),
    )
      .toBe("<p>'s Pug source code!</p>"));
});

describe("compileFileClient", () => {
  it("validPath", async () =>
    expect(
      await test(
        new Request("http://localhost:8080/compileFileClient"),
      ).then((res) => res.text())
        .then((text) => normalize(text)),
    )
      .toBe(
        normalize(
          `function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
        var pug_match_html=/["&<>]/;
        function pug_rethrow(e,n,r,t){if(!(e instanceof Error))throw e;if(!("undefined"==typeof window&&n||t))throw e.message+=" on line "+r,e;var o,a,i,s;try{t=t||require("fs").readFileSync(n,{encoding:"utf8"}),o=3,a=t.split("\\n"),i=Math.max(r-o,0),s=Math.min(a.length,r+o)}catch(t){return e.message+=" - could not read from "+n+" ("+t.message+")",void pug_rethrow(e,null,r)}o=a.slice(i,s).map(function(e,n){var t=n+i+1;return(t==r?"  > ":"    ")+t+"| "+e}).join("\\n"),e.path=n;try{e.message=(n||"Pug")+":"+r+"\\n"+o+"\\n\\n"+e.message}catch(e){}throw e}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;
            var locals_for_with = (locals || {});
            
            (function (name) {
              ;pug_debug_line = 1;pug_debug_filename = ".\\u002Fsrc\\u002Fpug\\u002Ftemplate.pug";
        pug_html = pug_html + "\\u003Cp\\u003E";
        ;pug_debug_line = 1;pug_debug_filename = ".\\u002Fsrc\\u002Fpug\\u002Ftemplate.pug";
        pug_html = pug_html + (pug_escape(null == (pug_interp = name) ? "" : pug_interp));
        ;pug_debug_line = 1;pug_debug_filename = ".\\u002Fsrc\\u002Fpug\\u002Ftemplate.pug";
        pug_html = pug_html + "'s Pug source code!\\u003C\\u002Fp\\u003E";
            }.call(this, "name" in locals_for_with ?
                locals_for_with.name :
                typeof name !== 'undefined' ? name : undefined));
            ;} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}`,
        ),
      ));
});
