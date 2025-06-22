const path = require('path');
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname)));

let lastBoard = null;

wss.on('connection', ws => {
  // send current board if exists
  if (lastBoard) {
    ws.send(JSON.stringify({ type: 'board', items: lastBoard }));
  }

  ws.on('message', data => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (err) {
      return;
    }

    if (msg.type === 'board') {
      lastBoard = msg.items;
      // broadcast board
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify({ type: 'board', items: lastBoard }));
        }
      });
    } else if (msg.type === 'roll') {
      const num = msg.num;
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify({ type: 'roll', num }));
        }
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
