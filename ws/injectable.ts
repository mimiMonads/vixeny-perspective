type Host = {
  hostname?: "string";
  port?: number;
};
export default (host?: Host) => `
    <script>
    let SOCKET;
    let TIME;

    const ping =  () => {
    if (SOCKET && SOCKET.readyState === WebSocket.OPEN) {
        SOCKET.send(Date.now().toString());
    }
    }

    function connect() {
    SOCKET = new WebSocket('ws://${host?.hostname ?? "localhost"}:${
  host?.port ?? 8000
}'); 

    SOCKET.addEventListener('open', () => {
        setTimeout(ping, 250);
    });

    SOCKET.addEventListener('message', (event) => {

        try {
        
        if (TIME && TIME !== Number(event.data) ) {
            location.reload();
        } else {
            TIME = Number(event.data)
        }
        } catch (e) {
        
        }
        setTimeout(ping, 250);
    });

    SOCKET.addEventListener('close', () => {
        setTimeout(connect, 250); 
    });

    SOCKET.addEventListener('error', (error) => {
        console.error('WebSocket error: ', error);
    });
    }

    window.onload = connect;

    </script>
 `;
