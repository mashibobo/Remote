
import React, { useState, useRef, useEffect } from "react";
import { useRemote } from "@/context/RemoteContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal as TerminalIcon, Send } from "lucide-react";

const Terminal: React.FC = () => {
  const { activeComputer, executeCommand, terminalHistory } = useRemote();
  const [command, setCommand] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when terminalHistory changes
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [terminalHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !activeComputer) return;

    executeCommand(command);
    setCommand("");
  };

  if (!activeComputer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-muted-foreground flex flex-col items-center space-y-4">
          <TerminalIcon className="h-12 w-12" />
          <p>Select a computer to access the terminal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-black/70 text-green-400 p-2 text-xs font-mono border-b border-white/10">
        Connected to {activeComputer.hostname} - PowerShell Terminal
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-2 bg-black/90">
        <div className="font-mono text-xs text-green-400 whitespace-pre-wrap">
          {terminalHistory.length === 0 ? (
            <div className="p-2 text-muted-foreground">
              PowerShell terminal ready. Type your commands below.
            </div>
          ) : (
            terminalHistory.map((entry, index) => (
              <div key={index} className="mb-2">
                <div className="flex">
                  <span className="text-blue-400 mr-1">{activeComputer.username}@{activeComputer.hostname}&gt;</span>
                  <span>{entry.command}</span>
                </div>
                <div className="ml-2 mt-1 text-green-400">{entry.output}</div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex items-center p-2 bg-black/70 border-t border-white/10">
        <div className="text-blue-400 mr-2 font-mono text-xs">
          {activeComputer.username}@{activeComputer.hostname}&gt;
        </div>
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Type your command..."
          className="flex-1 bg-transparent border-none text-green-400 font-mono text-xs focus-visible:ring-0"
        />
        <Button type="submit" size="icon" variant="ghost" disabled={!command.trim()}>
          <Send className="h-4 w-4 text-green-400" />
        </Button>
      </form>
    </div>
  );
};

export default Terminal;
