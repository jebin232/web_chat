// Minimal Node.js + Express + ws server
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// Serve static client files from ./public
app.use(express.static(path.join(__dirname, 'public')));


// Broadcast helper
function broadcast(data, sender) {
const msg = JSON.stringify(data);
wss.clients.forEach(client => {
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
} catch (e) {
console.warn('Invalid message:', message);
return;
}


// Example messages: { type: 'join', name: 'Alice' } or { type: 'message', text: 'Hi' }
if (parsed.type === 'message') {
// Echo the message to other clients
broadcast({ type: 'message', name: parsed.name, text: parsed.text, time: Date.now() }, ws);
} else if (parsed.type === 'join') {
// Notify others
broadcast({ type: 'system', text: `${parsed.name} joined the chat.`, time: Date.now() }, ws);
}
});


ws.on('close', () => {
console.log('Client disconnected. Count:', wss.clients.size);
});
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));