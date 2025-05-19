
import React from "react";
import { Computer } from "../types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Computer as ComputerIcon, Play, Terminal } from "lucide-react";
import { useRemote } from "@/context/RemoteContext";
import { formatDistanceToNow } from "date-fns";

interface ComputerCardProps {
  computer: Computer;
}

const ComputerCard: React.FC<ComputerCardProps> = ({ computer }) => {
  const { setActiveComputer, categories } = useRemote();
  
  const category = categories.find((c) => c.id === computer.categoryId);
  
  const handleConnect = () => {
    setActiveComputer(computer);
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
      computer.status === "online" ? "border-green-500/30" : 
      computer.status === "connecting" ? "border-yellow-500/30" : "border-red-500/30"
    }`}>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <ComputerIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium text-lg">{computer.hostname}</h3>
        </div>
        <Badge 
          variant={computer.status === "online" ? "default" : "outline"} 
          className={`${
            computer.status === "online" ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : 
            computer.status === "connecting" ? "bg-yellow-500/20 text-yellow-500" : 
            "bg-red-500/20 text-red-500"
          }`}
        >
          {computer.status === "online" ? "Online" : 
           computer.status === "connecting" ? "Connecting" : "Offline"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Username:</div>
          <div className="font-medium">{computer.username}</div>
          
          <div className="text-muted-foreground">Operating System:</div>
          <div className="font-medium">{computer.os}</div>
          
          <div className="text-muted-foreground">IP Address:</div>
          <div className="font-medium">{computer.ip}</div>
          
          <div className="text-muted-foreground">Category:</div>
          <div className="font-medium">{category?.name || "Uncategorized"}</div>
          
          <div className="text-muted-foreground">Last Seen:</div>
          <div className="font-medium">
            {formatDistanceToNow(new Date(computer.lastSeen), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={computer.status === "offline"}
          onClick={handleConnect}
        >
          {computer.status === "online" ? (
            <>
              <Play className="mr-2 h-4 w-4" /> Connect
            </>
          ) : computer.status === "connecting" ? (
            "Connecting..."
          ) : (
            "Offline"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComputerCard;
