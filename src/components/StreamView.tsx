
import React from "react";
import { useRemote } from "@/context/RemoteContext";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Computer,
  Mic,
  Play,
  Stop,
} from "lucide-react";

const StreamView: React.FC = () => {
  const {
    activeComputer,
    activeStream,
    toggleDesktopStream,
    toggleCameraStream,
    toggleAudioStream,
    updateStreamQuality,
  } = useRemote();

  if (!activeComputer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-background to-secondary/40">
        <div className="text-muted-foreground flex flex-col items-center space-y-4">
          <Computer className="h-12 w-12" />
          <p>Select a computer to start streaming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-black relative">
        {activeStream.desktop ? (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/10 flex items-center justify-center">
            {/* This would be replaced with actual stream in a real implementation */}
            <div className="w-full h-full p-4 flex items-center justify-center">
              <img
                src="/placeholder.svg"
                alt="Desktop Stream"
                className="max-w-full max-h-full object-contain rounded-md opacity-90"
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground space-y-4">
              <Computer className="h-16 w-16 mx-auto" />
              <p>Start the desktop stream to view content</p>
              <Button variant="default" onClick={toggleDesktopStream}>
                <Play className="h-4 w-4 mr-2" />
                Start Desktop Stream
              </Button>
            </div>
          </div>
        )}

        {/* Camera view (picture-in-picture) */}
        {activeStream.camera && (
          <div className="absolute bottom-4 right-4 w-64 h-48 bg-black/60 rounded-md overflow-hidden border border-white/20">
            {/* This would be replaced with actual camera feed in a real implementation */}
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-muted/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">
            {activeComputer.hostname} - {activeComputer.username}
          </div>
          <div className="text-sm text-muted-foreground">
            {activeComputer.os}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Desktop Stream</div>
            <Button
              variant={activeStream.desktop ? "destructive" : "default"}
              className="w-full"
              onClick={toggleDesktopStream}
            >
              {activeStream.desktop ? (
                <>
                  <Stop className="h-4 w-4 mr-2" /> Stop Desktop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" /> Start Desktop
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Camera Stream</div>
            <Button
              variant={activeStream.camera ? "destructive" : "default"}
              className="w-full"
              onClick={toggleCameraStream}
            >
              {activeStream.camera ? (
                <>
                  <Stop className="h-4 w-4 mr-2" /> Stop Camera
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" /> Start Camera
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Audio Stream</div>
            <Button
              variant={activeStream.audio ? "destructive" : "default"}
              className="w-full"
              onClick={toggleAudioStream}
            >
              {activeStream.audio ? (
                <>
                  <Stop className="h-4 w-4 mr-2" /> Stop Audio
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" /> Start Audio
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quality: {activeStream.quality.fps} FPS</span>
          </div>
          <Slider
            defaultValue={[activeStream.quality.fps]}
            min={10}
            max={60}
            step={5}
            onValueChange={(values) => updateStreamQuality(values[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (10 FPS)</span>
            <span>Medium (30 FPS)</span>
            <span>High (60 FPS)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamView;
