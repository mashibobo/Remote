
import React from "react";
import { useRemote } from "@/context/RemoteContext";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

const PasswordRecovery: React.FC = () => {
  const { activeComputer, retrievePasswords } = useRemote();
  const [loading, setLoading] = React.useState(false);

  const handleRecoverPasswords = () => {
    if (!activeComputer) return;
    
    setLoading(true);
    retrievePasswords();
    
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  if (!activeComputer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-muted-foreground flex flex-col items-center space-y-4">
          <Key className="h-12 w-12" />
          <p>Select a computer to recover passwords</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-md w-full space-y-8 bg-muted/30 p-6 rounded-lg">
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Password Recovery</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Recover stored passwords from browsers and Windows accounts on {activeComputer.hostname}
          </p>
        </div>
        
        <div className="space-y-4 text-center">
          <p className="text-sm">
            This tool will search for saved passwords in:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Google Chrome</li>
            <li>• Mozilla Firefox</li>
            <li>• Microsoft Edge</li>
            <li>• Windows Credentials</li>
          </ul>
          
          <Button
            className="w-full mt-6"
            onClick={handleRecoverPasswords}
            disabled={loading}
          >
            {loading ? "Recovering Passwords..." : "Recover Passwords"}
          </Button>
          
          <p className="text-xs text-muted-foreground pt-4">
            Results will appear in the terminal after retrieval is complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
