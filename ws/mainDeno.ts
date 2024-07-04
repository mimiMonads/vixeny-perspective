
let SERVER_TIME = Date.now() + 1000

Deno.serve((req) => {
    // First, we verify if the client is negotiating to upgrade to websockets.
    // If not, we can give a status of 501 to specify we don't support plain
    // http requests.
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }
  
    // We can then upgrade the request to a websocket
    const { socket, response } = Deno.upgradeWebSocket(req);
  
    // We now have access to a standard websocket object.
    // Let's handle the "open" event
    socket.addEventListener("open", (event) => {
        socket.send(SERVER_TIME);
    });
  
    // We can also handle messages in a similar way. Here we set up
    // a simple ping / pong example.
    socket.addEventListener("message", (event) => {
        socket.send(SERVER_TIME);
      
    });
  
    // Lastly we return the response created from upgradeWebSocket.
    return response;
  });