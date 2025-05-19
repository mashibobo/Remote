
# Client-Server Connection Guide

This document explains how to connect your client applications to the remote management server.

## Server-Side Setup

1. **Deploy the server application:**
   - Host the web application on a server with a public IP address
   - Set up HTTPS with a valid SSL certificate
   - Configure any necessary firewalls to allow incoming connections

2. **API Authentication:**
   - Implement authentication for API endpoints
   - Consider using API keys or JWT tokens
   - Set up rate limiting to prevent abuse

3. **Database Configuration:**
   - Ensure the database is properly secured
   - Set up backups for important data
   - Configure proper user permissions

## Client Configuration

1. **Update the client code:**
   - Open the `RemoteClient.cs` file
   - Change the `ServerUrl` constant to your actual server URL:
     ```csharp
     private static readonly string ServerUrl = "https://your-server-url.com";
     ```

2. **Build the client:**
   - Run the build script: `build.bat`
   - The executable will be created in the publish directory

3. **Distribution:**
   - Distribute the client to target computers
   - Consider signing the executable with a code signing certificate
   - Create an installer if needed

## Connection Flow

1. Client starts up and registers with the server
2. Server adds the client to the active computers list
3. Client regularly polls for commands
4. When a command is issued from the web interface, the client executes it
5. Results are sent back to the server
6. Desktop streaming and keylogging operate on separate timers

## Troubleshooting

- **Client can't connect to server:**
  - Check network connectivity
  - Verify the server URL is correct
  - Ensure firewalls allow outgoing connections

- **Commands not executing:**
  - Check if the client is showing as online in the web interface
  - Verify the command format is correct
  - Check server logs for errors

- **Desktop stream issues:**
  - Adjust the streaming quality settings
  - Check if the client has sufficient permissions
  - Verify network bandwidth is adequate

## Security Recommendations

1. **Network Security:**
   - Use HTTPS for all communications
   - Consider setting up a VPN for additional security
   - Implement IP filtering if possible

2. **Authentication:**
   - Use strong authentication mechanisms
   - Implement multi-factor authentication for the web interface
   - Regularly rotate credentials

3. **Data Protection:**
   - Encrypt sensitive data in transit and at rest
   - Implement proper access controls
   - Regular security audits and updates
