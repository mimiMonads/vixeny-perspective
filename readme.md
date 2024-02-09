# vixeny-prespective

The `vixeny-prespective` is a plugin for the Vixeny library, designed to extend
its capabilities with template rendering. This plugin allows applications using
Vixeny to compile, render, and manage templates easily, providing a seamless
integration for web applications to generate dynamic HTML content.

# Pug

## Installation

To use `vixeny-prespective` in your project, first, ensure that you have Vixeny.
Then, install `vixeny-prespective` via npm:

```bash
npm install vixeny-prespective
```

It comes with:

- compileFile as composeCompiledFile
- compile as composeCompiled
- compileClient as composecompiledClient
- compileFileClient as composeCompiledFileClient,
- render as render,
- renderFile as renderFile

## Usage

After installing, you can import and use `vixeny-prespective` in your Vixeny
application to utilize Pug templates. Here is a basic example of setting up your
application with the plugin:

Please add a folder: `src/pug` with the name `template.pug` with:

```pug
p #{name}'s Pug source code!
```

```typescript
import { vixeny, wrap } from "vixeny";
import { pug } from "vixeny-prespective"; // Importing the plugin options

// Modify your helpers.ts to include pugOptions
const pugOptions = {
  cyclePlugin: {
    compileFile: pug.compileFile,
    compile: pug.compile,
    compileClient: pug.compileClient,
    compileFileClient: pug.compileFileClient,
    render: pug.render,
    renderFile: pug.renderFile,
  },
};

const routes = wrap(pugOptions)()
  .stdPetition({
    path: "/compileFile",
    headings: {
      headers: ".html",
    },
    plugins: {
      compileFile: {
        path: "./src/pug/template.pug",
      },
    },
    f: (c) => c.compileFile({ name: "helloworld" }),
  })
  .stdPetition({
    path: "/compile",
    headings: {
      headers: ".html",
    },
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
    headings: {
      headers: ".html",
    },
    path: "/render",
    f: (c) => c.render(`p #{name}'s Pug source code!`),
  })
  .stdPetition({
    headings: {
      headers: ".html",
    },
    path: "/renderFile",
    f: (c) => c.renderFile("./src/pug/template.pug"),
  });

// Example of setting up a Vixeny app with Pug template rendering in Bun in http://localhost:3000/
Bun.serve({
  fetch: vixeny(pugOptions)(routes.unwrap()),
});
```

## Features

- **Compile Pug Templates**: Convert Pug templates into HTML strings
  server-side.
- **Render Pug Files**: Directly render Pug files into HTML, supporting dynamic
  content.
- **Compile for Client**: Prepare Pug templates for client-side use, allowing
  templates to be used directly in the browser.
- **Comprehensive Pug Support**: Utilizes the full power of Pug for dynamic
  template rendering within the Vixeny framework.

## Testing

`vixeny-prespective` comes with a set of tests to ensure functionality. Refer to
the provided test file examples to write and run tests for your applications
using the plugin.

## Contributing

Contributions to `vixeny-prespective` are welcome. Please follow the standard
pull request process, and ensure all tests pass before submitting your
contribution.
