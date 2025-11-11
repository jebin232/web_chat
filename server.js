// Minimal Node.js + Express + ws server with Seen + Reply
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static client files
app.use(express.static(path.join(__dirname, 'public')));

function broadcast(data, sender) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== sender) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected. Count:', wss.clients.size);

  ws.on('message', (message) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {
      console.warn('Invalid message:', message);
      return;
    }

    if (parsed.type === 'message') {
      // Send to others
      broadcast(
        {
          type: 'message',
          id: parsed.id,
          name: parsed.name,
          text: parsed.text,
          replyTo: parsed.replyTo,
          time: Date.now(),
        },
        ws
      );
    } else if (parsed.type === 'join') {
      broadcast(
        { type: 'system', text: `${parsed.name} joined the chat.`, time: Date.now() },
        ws
      );
    } else if (parsed.type === 'seen') {
      // Forward seen info to everyone except sender
      broadcast({ type: 'seen', id: parsed.id }, ws);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected. Count:', wss.clients.size);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
