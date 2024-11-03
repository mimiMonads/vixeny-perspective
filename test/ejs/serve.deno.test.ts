import { petitions, plugins, vixeny } from "vixeny";
import { ejsStaticServerPlugin } from "../../src/ejs/staticServer.ts";
import { renderFile } from "ejs";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
const normalize = (s: string) =>
  s.replace(/(?<!`|\$\{.*)(["'])(?:(?=(\\?))\2.)*?\1/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ +/g, " ");

const serve = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/ejs/public/",
    template: [ejsStaticServerPlugin({
      renderFile,
      plugins,
      petitions,
    })],
  },
]);

const serve2 = vixeny()([
  {
    type: "fileServer",
    name: "/",
    path: "./public/ejs/public/",
    template: [
      ejsStaticServerPlugin({
        renderFile,
        plugins,
        petitions,
        option: {
          preserveExtension: false,
        },
      }),
    ],
  },
]);

Deno.test("compile", async () => {
  const response = await serve(new Request("http://localhost:8080/main.ejs"));
  const text = normalize(await response.text());
  assertEquals(
    text,
    normalize(
      `<!DOCTYPE html> <html lang= > <head> <meta charset= > <meta name= content= > <title>Home Page</title> <style> body, html { margin: 0; padding: 0; font-family: , sans-serif; background-color: #2C2A4A; /* Dark purple background */ color: #C7C5F4; /* Light purple text */ } header, footer { background-color: #1E1C36; /* Darker purple */ color: white; padding: 10px 0; text-align: center; } main { padding: 20px; text-align: center; } .centered-img { display: block; margin-left: auto; margin-right: auto; width: 50%; /* Adjust as needed */ } </style> </head> <body> <header> <nav> <a href= style= >Home</a> <a href= style= >Docs</a> </nav> </header> <main> <h1>Welcome to Our Website</h1> <p>This is the main page. xd free to explore.</p> <img src= alt= class= > </main> <footer> <p>© 2024 Company Name</p> </footer> </body> </html> `,
    ),
  );
});

Deno.test("same", async () => {
  const response = await serve(new Request("http://localhost:8080/main.ejs"));
  const response2 = await serve2(new Request("http://localhost:8080/main"));
  const text = normalize(await response.text());
  const text2 = normalize(await response2.text());
  assertEquals(text, text2);
});
