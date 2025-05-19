
export type Category = {
  id: string;
  name: string;
};

export type ComputerStatus = 'online' | 'offline' | 'connecting';

export type Computer = {
  id: string;
  hostname: string;
  username: string;
  os: string;
  ip: string;
  categoryId: string;
  status: ComputerStatus;
  lastSeen: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
};

export type StreamQuality = {
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
};

export type ActiveStream = {
  desktop: boolean;
  camera: boolean;
  audio: boolean;
  quality: StreamQuality;
};

export type ViewMode = 'grid' | 'list';
