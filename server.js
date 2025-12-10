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

function broadcast(data, sender) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client !== sender) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastAll(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
  });
}

wss.on('connection', (ws) => {
  // Update user count on connection
  broadcastAll({ type: 'count', count: wss.clients.size });

  ws.on('message', (message) => {
    let parsed;
    try { parsed = JSON.parse(message); } catch { return; }

    if (parsed.type === 'join') {
      ws.userName = parsed.name; // Store name on the socket
      broadcast(parsed, ws); // Tell others I joined
    }
    else if (parsed.type === 'message') {
      broadcastAll({ ...parsed, time: Date.now() });
    }
    else if (parsed.type === 'typing' || parsed.type === 'stopTyping') {
      broadcast(parsed, ws); // Forward typing status to others
    }
    else if (parsed.type === 'delete' || parsed.type === 'edit') {
      broadcastAll(parsed);
    }
  });

  ws.on('close', () => {
    // Send "User Left" message
    if (ws.userName) {
      broadcastAll({ type: 'system', text: `${ws.userName} left`, time: Date.now() });
    }
    broadcastAll({ type: 'count', count: wss.clients.size });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));