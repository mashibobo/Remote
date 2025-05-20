
export type ViewMode = "grid" | "list";

export interface Computer {
  id: string;
  hostname: string;
  username: string;
  os: string;
  ip: string;
  categoryId: string;
  status: "online" | "offline" | "connecting";
  lastSeen: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  lastScreenshot?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface StreamQuality {
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
}

export interface ActiveStream {
  desktop: boolean;
  camera: boolean;
  audio: boolean;
  quality: StreamQuality;
}
