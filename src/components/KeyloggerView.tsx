
import React, { useState } from "react";
import { useRemote } from "@/context/RemoteContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Key, Save, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Sample keylogger data for demo purposes
const sampleKeyloggerData = [
  {
    timestamp: "2024-05-19T10:15:32Z",
    application: "Chrome",
    windowTitle: "Google - Search",
    text: "how to make chocolate cake",
  },
  {
    timestamp: "2024-05-19T10:17:45Z",
    application: "Notepad",
    windowTitle: "Untitled - Notepad",
    text: "Shopping list: milk, eggs, flour, sugar",
  },
  {
    timestamp: "2024-05-19T10:20:12Z",
    application: "Microsoft Word",
    windowTitle: "Document1 - Word",
    text: "Dear Sir/Madam, I am writing to inquire about...",
  },
];

const KeyloggerView: React.FC = () => {
  const { activeComputer, keyloggerActive, toggleKeylogger } = useRemote();
  const [keyloggerData, setKeyloggerData] = useState(sampleKeyloggerData);
  
  const handleClearData = () => {
    setKeyloggerData([]);
    toast.success("Keylogger data cleared");
  };
  
  const handleSaveData = () => {
    // In a real app, this would save to a file or database
    toast.success("Keylogger data saved");
  };

  if (!activeComputer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-muted-foreground flex flex-col items-center space-y-4">
          <Key className="h-12 w-12" />
          <p>Select a computer to access keylogger</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-secondary/30 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium">Keylogger</h3>
          <p className="text-sm text-muted-foreground">
            {keyloggerActive ? "Currently recording keystrokes" : "Not active"}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={keyloggerActive ? "destructive" : "default"}
            size="sm"
            onClick={toggleKeylogger}
          >
            {keyloggerActive ? "Stop Keylogger" : "Start Keylogger"}
          </Button>
        </div>
      </div>
      
      {keyloggerActive && (
        <div className="bg-accent/20 p-2 text-center text-xs animate-pulse-slow">
          Keylogger is active and recording keystrokes
        </div>
      )}
      
      <ScrollArea className="flex-1">
        {keyloggerData.length > 0 ? (
          <div className="divide-y divide-border">
            {keyloggerData.map((entry, index) => (
              <div key={index} className="p-4 hover:bg-muted/50">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{entry.application}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {entry.windowTitle}
                </div>
                <div className="p-2 bg-muted rounded text-sm">{entry.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
            {keyloggerActive ? (
              <p>Waiting for keystrokes...</p>
            ) : (
              <p>No keylogger data available</p>
            )}
          </div>
        )}
      </ScrollArea>
      
      {keyloggerData.length > 0 && (
        <div className="p-3 bg-muted/30 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {keyloggerData.length} entries recorded
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleSaveData}>
              <Save className="h-4 w-4 mr-2" />
              Save Data
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyloggerView;
