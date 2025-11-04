export interface FireBot {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  latitude: number;
  longitude: number;
  lastActive?: string;
}

export interface CitizenFeedback {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  rating: number;
}
