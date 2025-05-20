
# Remote Management System

A comprehensive solution for managing and monitoring remote computers.

## Features

- Real-time computer monitoring
- Remote desktop viewing
- File transfer capabilities
- Command execution
- Location tracking
- Keylogger functionality
- Password recovery simulation

## Project Structure

```
remote-management-system/
├── client/                  # C# client application
│   ├── RemoteClient.cs      # Main client code
│   ├── RemoteClient.csproj  # Client project file
│   └── build.bat            # Build script for Windows
├── public/                  # Static assets
├── src/                     # Source code for React app
│   ├── api/                 # API utilities
│   ├── components/          # React components
│   ├── context/             # React contexts
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   ├── server/              # Server-side code
│   └── types.ts             # TypeScript type definitions
├── package.json             # Frontend dependencies
└── package-server.json      # Server dependencies
```

## Setting up the Server

1. Make sure you have Node.js installed (v14 or higher)
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The application will be available at http://localhost:3000
5. The API server will run on port 3001

## Setting up the Client

1. Navigate to the client directory
2. Make sure you have .NET SDK installed (5.0 or higher)
3. Update the server URL in `RemoteClient.cs` to point to your server
4. Build the client:
   ```
   dotnet build
   ```
   Or on Windows, you can use:
   ```
   build.bat
   ```
5. Distribute the compiled client to remote computers you want to manage

## Deployment

To deploy the application:

1. Build the React frontend:
   ```
   npm run build
   ```
2. Set up your server with Node.js
3. Copy the contents of the `dist` folder to your server
4. Start the server:
   ```
   node server.js
   ```

## Security Considerations

This application has powerful capabilities that could be misused. Always:

- Use strong authentication
- Keep the client application secure
- Obtain proper authorization before installing on any computer
- Follow all applicable laws and regulations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
