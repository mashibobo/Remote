
import React, { useState } from "react";
import { useRemote } from "@/context/RemoteContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Folder,
  File,
  ArrowLeft,
  ArrowRight,
  Upload,
  Download,
  RefreshCw,
} from "lucide-react";

type FileType = "folder" | "file";

interface FileItem {
  name: string;
  type: FileType;
  size?: string;
  modified?: string;
  path: string;
}

// Mock file system data
const mockFileSystem: Record<string, FileItem[]> = {
  "/": [
    { name: "Documents", type: "folder", path: "/Documents" },
    { name: "Downloads", type: "folder", path: "/Downloads" },
    { name: "Pictures", type: "folder", path: "/Pictures" },
    { name: "Videos", type: "folder", path: "/Videos" },
    { name: "config.ini", type: "file", size: "2.5 KB", modified: "2024-05-15", path: "/config.ini" },
    { name: "readme.txt", type: "file", size: "1.2 KB", modified: "2024-04-20", path: "/readme.txt" },
  ],
  "/Documents": [
    { name: "Work", type: "folder", path: "/Documents/Work" },
    { name: "Personal", type: "folder", path: "/Documents/Personal" },
    { name: "report.docx", type: "file", size: "568 KB", modified: "2024-05-17", path: "/Documents/report.docx" },
    { name: "budget.xlsx", type: "file", size: "124 KB", modified: "2024-05-10", path: "/Documents/budget.xlsx" },
  ],
  "/Downloads": [
    { name: "Software", type: "folder", path: "/Downloads/Software" },
    { name: "setup.exe", type: "file", size: "145 MB", modified: "2024-05-18", path: "/Downloads/setup.exe" },
    { name: "movie.mp4", type: "file", size: "1.2 GB", modified: "2024-05-15", path: "/Downloads/movie.mp4" },
  ],
};

const FileExplorer: React.FC = () => {
  const { activeComputer, uploadFile, downloadFile } = useRemote();
  const [currentPath, setCurrentPath] = useState("/");
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>(mockFileSystem["/"]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [uploadInput, setUploadInput] = useState<HTMLInputElement | null>(null);

  const navigateTo = (path: string) => {
    setPathHistory((prev) => [...prev, currentPath]);
    setForwardHistory([]);
    setCurrentPath(path);
    setFiles(mockFileSystem[path] || []);
    setSelectedFile(null);
  };

  const navigateBack = () => {
    if (pathHistory.length === 0) return;
    
    const previousPath = pathHistory[pathHistory.length - 1];
    setPathHistory((prev) => prev.slice(0, -1));
    setForwardHistory((prev) => [currentPath, ...prev]);
    setCurrentPath(previousPath);
    setFiles(mockFileSystem[previousPath] || []);
    setSelectedFile(null);
  };

  const navigateForward = () => {
    if (forwardHistory.length === 0) return;
    
    const nextPath = forwardHistory[0];
    setForwardHistory((prev) => prev.slice(1));
    setPathHistory((prev) => [...prev, currentPath]);
    setCurrentPath(nextPath);
    setFiles(mockFileSystem[nextPath] || []);
    setSelectedFile(null);
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      navigateTo(file.path);
    } else {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    uploadInput?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    
    const file = e.target.files[0];
    await uploadFile(currentPath, file);
    
    // Mock updating the file list
    const newFile: FileItem = {
      name: file.name,
      type: "file",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      modified: new Date().toISOString().split("T")[0],
      path: `${currentPath}/${file.name}`,
    };
    
    setFiles((prev) => [...prev, newFile]);
    
    // Clear the input
    if (uploadInput) {
      uploadInput.value = "";
    }
  };

  const handleDownload = async () => {
    if (!selectedFile || selectedFile.type !== "file") return;
    
    await downloadFile(selectedFile.path);
  };

  const handleRefresh = () => {
    setFiles([...files]);
  };

  if (!activeComputer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-muted-foreground flex flex-col items-center space-y-4">
          <Folder className="h-12 w-12" />
          <p>Select a computer to access the file system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 p-2 bg-muted/30 border-b">
        <Button
          variant="outline"
          size="icon"
          onClick={navigateBack}
          disabled={pathHistory.length === 0}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={navigateForward}
          disabled={forwardHistory.length === 0}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Input
          value={currentPath}
          readOnly
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <input
          type="file"
          ref={(input) => setUploadInput(input)}
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button variant="outline" size="icon" onClick={handleUploadClick}>
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          disabled={!selectedFile || selectedFile.type !== "file"}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {files.map((file) => (
            <div
              key={file.path}
              className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted/50 ${
                selectedFile?.path === file.path ? "bg-muted" : ""
              }`}
              onClick={() => handleFileClick(file)}
            >
              {file.type === "folder" ? (
                <Folder className="h-5 w-5 mr-2 text-blue-400" />
              ) : (
                <File className="h-5 w-5 mr-2 text-gray-400" />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate">{file.name}</div>
                {file.type === "file" && (
                  <div className="text-xs text-muted-foreground">
                    {file.size} • Modified: {file.modified}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {files.length === 0 && (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              This folder is empty
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
