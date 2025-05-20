
import React from "react";
import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRemote } from "@/context/RemoteContext";

const WaitingAnimation: React.FC = () => {
  const { refreshComputers } = useRemote();

  return (
    <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
      <div className="text-center space-y-4">
        <LoaderCircle className="mx-auto h-16 w-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold text-primary">Waiting for clients...</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          No clients are currently connected to your dashboard. When clients connect, they will appear here.
        </p>
        
        <div className="flex flex-col items-center space-y-2 mt-8">
          <p className="text-sm text-muted-foreground">To connect a client:</p>
          <ol className="text-sm text-left space-y-2 mt-2">
            <li>1. Download and run the client application</li>
            <li>2. Configure the client with your server address</li>
            <li>3. Launch the client on the remote computer</li>
          </ol>
        </div>
        
        <button
          onClick={refreshComputers}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Refresh
        </button>
      </div>
      
      <div className="w-full max-w-3xl space-y-4 mt-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingAnimation;
