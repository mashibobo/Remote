
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Server, Monitor, FileTerminal } from "lucide-react";

const ServerSetupGuide: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Remote Management Setup Guide</CardTitle>
        <CardDescription>
          Follow these instructions to get your remote management system up and running
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="server">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="server">
              <Server className="mr-2 h-4 w-4" />
              Server Setup
            </TabsTrigger>
            <TabsTrigger value="client">
              <Monitor className="mr-2 h-4 w-4" />
              Client Setup
            </TabsTrigger>
            <TabsTrigger value="structure">
              <FileTerminal className="mr-2 h-4 w-4" />
              File Structure
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="server" className="space-y-4">
            <h3 className="text-lg font-medium">Setting up the server</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Make sure you have Node.js installed (v14 or higher)</li>
              <li>Navigate to your project directory in a terminal</li>
              <li>Install dependencies with: <code className="bg-muted p-1 rounded">npm install</code></li>
              <li>Start the server with: <code className="bg-muted p-1 rounded">npm run dev</code></li>
              <li>The server will start on port 3000 by default</li>
              <li>The API server runs on port 3001</li>
            </ol>
          </TabsContent>
          
          <TabsContent value="client" className="space-y-4">
            <h3 className="text-lg font-medium">Setting up the client</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Find the client code in the <code className="bg-muted p-1 rounded">client</code> folder</li>
              <li>Make sure you have .NET SDK installed</li>
              <li>Compile the client with: <code className="bg-muted p-1 rounded">dotnet build</code></li>
              <li>Update the server URL in the client config to match your server's address</li>
              <li>Run the client executable on remote computers you want to manage</li>
            </ol>
          </TabsContent>
          
          <TabsContent value="structure" className="space-y-4">
            <h3 className="text-lg font-medium">Project File Structure</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
{`remote-management-system/
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
`}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline">Download Documentation</Button>
        <Button>Visit GitHub Repo</Button>
      </CardFooter>
    </Card>
  );
};

export default ServerSetupGuide;
