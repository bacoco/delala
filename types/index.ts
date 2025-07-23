// Core data models for TGV MAX Checker

export interface Station {
  name: string;
  code: string;
  region?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Route {
  departureStation: Station;
  arrivalStation: Station;
  date: Date;
}

export interface Connection {
  station: Station;
  arrivalTime: string;
  departureTime: string;
  platform?: string;
  duration: number; // minutes to wait
}

export interface Train {
  trainNumber: string;
  type: string; // TGV, TER, Intercités, etc.
  departureTime: string;
  arrivalTime: string;
  duration: number; // in minutes
  stops: number;
  platform?: string;
  tgvMaxAvailable?: boolean;
  connections?: Connection[];
  price?: number; // regular price if available
}

export interface SearchFilters {
  timeRange?: {
    start: string; // HH:mm format
    end: string;
  };
  maxDuration?: number; // minutes
  maxConnections?: number;
  sortBy?: 'earliest' | 'fastest' | 'connections';
}

export interface FavoriteRoute {
  id: string;
  departureStation: Station;
  arrivalStation: Station;
  nickname?: string;
  createdAt: Date;
}

export interface NotificationPreference {
  id: string;
  route: FavoriteRoute;
  frequency: 'immediate' | 'hourly' | 'daily';
  enabled: boolean;
  lastSent?: Date;
}

// API Response types
export interface TrainSearchResponse {
  trains: Train[];
  searchDate: Date;
  route: Route;
  totalResults: number;
  warning?: string; // Optional warning for fallback data
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Form types
export interface SearchFormData {
  departure: string;
  arrival: string;
  date: string;
}

// UI State types
export interface SearchState {
  isLoading: boolean;
  error: ApiError | null;
  results: TrainSearchResponse | null;
  filters: SearchFilters;
}