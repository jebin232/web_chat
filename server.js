const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Ensure uploads directory
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ url: `/uploads/${req.file.filename}`, type: req.file.mimetype });
});

// Helper: Broadcast to everyone in the same room as the sender (excluding sender)
function broadcast(data, sender) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client !== sender && client.roomId === sender.roomId) {
      client.send(JSON.stringify(data));
    }
  });
}

// Helper: Broadcast to everyone in a specific room (including sender)
function broadcastRoom(data, roomId) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
      client.send(JSON.stringify(data));
    }
  });
}

// Helper: Get count of users in a specific room
function getRoomCount(roomId) {
  let count = 0;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) count++;
  });
  return count;
}

wss.on('connection', (ws) => {
  // Default room is 'global'
  ws.roomId = 'global';
  
  // Update count for global room initially
  broadcastRoom({ type: 'count', count: getRoomCount('global') }, 'global');

  ws.on('message', (message) => {
    let parsed;
    try { parsed = JSON.parse(message); } catch { return; }

    // 📌 JOIN SYSTEM (Global or Room)
    if (parsed.type === 'join') {
      ws.userName = parsed.name;
      broadcast({ type: 'system', text: `${ws.userName} joined the chat` }, ws);
    }

    // 📌 SWITCH ROOMS
    else if (parsed.type === 'joinRoom') {
      const oldRoom = ws.roomId;
      const newRoom = parsed.roomId;
      
      // Notify old room user left
      if(ws.userName) {
        broadcastRoom({ type: 'system', text: `${ws.userName} left the room` }, oldRoom);
        broadcastRoom({ type: 'count', count: getRoomCount(oldRoom) - 1 }, oldRoom); // -1 because this socket is leaving
      }

      // Update Socket Data
      ws.roomId = newRoom;

      // Notify new room user joined
      broadcastRoom({ type: 'system', text: `${ws.userName || 'Someone'} joined the room` }, newRoom);
      broadcastRoom({ type: 'count', count: getRoomCount(newRoom) }, newRoom);
    }

    // 📌 MESSAGES
    else if (parsed.type === 'message') {
      broadcastRoom({ ...parsed, time: Date.now() }, ws.roomId);
    }

    // 📌 TYPING / STOP TYPING
    else if (parsed.type === 'typing' || parsed.type === 'stopTyping') {
      broadcast(parsed, ws);
    }

    // 📌 ACTIONS
    else if (parsed.type === 'delete' || parsed.type === 'edit') {
      broadcastRoom(parsed, ws.roomId);
    }
  });

  ws.on('close', () => {
    if (ws.userName) {
      broadcastRoom({ type: 'system', text: `${ws.userName} left`, time: Date.now() }, ws.roomId);
    }
    broadcastRoom({ type: 'count', count: getRoomCount(ws.roomId) }, ws.roomId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));