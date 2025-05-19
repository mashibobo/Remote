
import React from "react";
import { useRemote } from "@/context/RemoteContext";
import { Computer, Category } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ComputerList: React.FC = () => {
  const { computers, categories, setActiveComputer } = useRemote();

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const handleConnect = (computer: Computer) => {
    setActiveComputer(computer);
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Hostname</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>OS</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {computers.map((computer) => (
            <TableRow key={computer.id}>
              <TableCell>
                <Badge
                  variant={computer.status === "online" ? "default" : "outline"}
                  className={`${
                    computer.status === "online"
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                      : computer.status === "connecting"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {computer.status === "online"
                    ? "Online"
                    : computer.status === "connecting"
                    ? "Connecting"
                    : "Offline"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{computer.hostname}</TableCell>
              <TableCell>{computer.username}</TableCell>
              <TableCell>{computer.os}</TableCell>
              <TableCell>{computer.ip}</TableCell>
              <TableCell>{getCategoryName(computer.categoryId)}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(computer.lastSeen), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={computer.status === "offline"}
                  onClick={() => handleConnect(computer)}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComputerList;
