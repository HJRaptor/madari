export interface Stream {
  id: string;
  quality: string;
  provider: string;
  url: string;
}

export interface Episode {
  id: string;
  title: string;
  episode: number;
  thumbnail: string;
  duration: string;
  description: string;
  streams: Stream[];
}

export interface Season {
  id: number;
  seasonNumber: number;
  episodes: Episode[];
}

export interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  seasons: Season[];
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  duration: string;
  streams: Stream[];
}
