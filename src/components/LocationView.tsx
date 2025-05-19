
import React, { useState } from "react";
import { useRemote } from "@/context/RemoteContext";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const LocationView: React.FC = () => {
  const { activeComputer } = useRemote();
  const [loading, setLoading] = useState(false);

  const handleRefreshLocation = () => {
    if (!activeComputer) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  if (!activeComputer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-muted-foreground flex flex-col items-center space-y-4">
          <MapPin className="h-12 w-12" />
          <p>Select a computer to view location data</p>
        </div>
      </div>
    );
  }

  const location = activeComputer.location;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-secondary/30 p-4 flex items-center justify-between">
        <div className="font-medium">Location Information</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshLocation}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Location"}
        </Button>
      </div>
      
      <div className="flex-1 p-4">
        {location ? (
          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">GPS Coordinates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Latitude</div>
                  <div className="font-medium">{location.latitude}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Longitude</div>
                  <div className="font-medium">{location.longitude}</div>
                </div>
              </div>
            </div>
            
            {location.address && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Address</h3>
                <div className="font-medium">{location.address}</div>
              </div>
            )}
            
            <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Map would be displayed here
                  <div className="mt-2 flex justify-center">
                    <div className="inline-block p-1 bg-accent animate-pulse-slow rounded-full">
                      <div className="p-2 bg-background rounded-full">
                        <MapPin className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Network Information</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">IP Address</div>
                  <div className="font-medium">{activeComputer.ip}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">ISP</div>
                  <div className="font-medium">Sample ISP Inc.</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Connection</div>
                  <div className="font-medium">Broadband</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-muted-foreground text-center space-y-4">
              <MapPin className="h-12 w-12 mx-auto" />
              <p>No location data available for this computer</p>
              <Button onClick={handleRefreshLocation} disabled={loading}>
                {loading ? "Refreshing..." : "Request Location Data"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationView;
