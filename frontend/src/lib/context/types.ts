import { ReactNode } from "react";

interface ScrapeResponse {
  id: number;
  total_artists: number;
  seed_artist: string;
  depth: number;
}

export interface Playlist {
  name: string 
  id: string 
}

export interface AppState {
  playlists: Playlist[];
  genres: string[];
  selectedGenres: string[];
  scrapes: ScrapeResponse[];
  activeScrapes: number[];
}

export interface AppContextType {
  app: AppState;
  setApp: React.Dispatch<React.SetStateAction<AppState>>;
}

export interface AppProviderProps {
  children: ReactNode;
}

export interface ArtistPool {
  artists: ArtistPoolItem[];
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface ArtistPoolItem {
  name: string;
  id: string;
  images: Image[];
}
