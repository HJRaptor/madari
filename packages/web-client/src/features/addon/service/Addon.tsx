import {
  AddonConfig,
  AddonResource,
} from '@/features/addon/hooks/use-fetch.tsx';

export class Addon {
  constructor(
    public config: AddonConfig,
    public installUrl: string,
  ) {}

  loadCatalog(): {
    title: string;
    url: string;
    id: string;
    type: string;
  }[] {
    return this.config.catalogs.map((res) => {
      return {
        id: `${this.config.id}/${res.type}/${res.name}`,
        title: capitalizeWords(`${res.name} ${res.type}`),
        type: res.type,
        url: `${this.config.url}/catalog/${res.type}/${res.id}.json`,
      };
    });
  }

  search(query: string) {
    return this.config.catalogs
      .filter((res) =>
        res.extra?.find((extraItem) => extraItem.name === 'search'),
      )
      .map((res) => {
        return {
          id: `${this.config.id}/${res.type}/${res.name}`,
          title: capitalizeWords(`${res.name} ${res.type}`),
          type: res.type,
          url: `${this.config.url}/catalog/${res.type}/${res.id}/search=${encodeURIComponent(query)}.json`,
        };
      });
  }

  loadItem(item: { type: string; id: string }) {
    return `${this.config.url}/meta/${item.type}/${item.id}.json`;
  }

  get resources() {
    return this.config.resources.map((res) => {
      if (typeof res === 'string') {
        return res;
      }
      return res.name;
    });
  }

  get streamInfo(): AddonResource | null {
    return this.config.resources.find((res) => {
      if (typeof res === 'string') {
        return null;
      }
      return res.name === 'stream';
    }) as AddonResource;
  }

  get supportStream(): boolean {
    return this.resources.indexOf('stream') !== -1;
  }

  loadStream(item: {
    type: string;
    id: string;
    episode?: number;
    season?: number;
  }) {
    if (item.episode && item.season && item.type === 'series') {
      return `${this.config.url}/stream/${item.type}/${item.id}:${item.season}:${item.episode}.json`;
    }

    return `${this.config.url}/stream/${item.type}/${item.id}.json`;
  }
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface MovieInfo {
  imdb_id: string;
  name: string;
  type: string;
  cast: string[];
  country: string;
  description: string;
  genre: string[];
  imdbRating: string;
  released: Date;
  slug: string;
  year: string;
  runtime: string;
  status: string;
  tvdb_id: number;
  moviedb_id: number;
  popularities: Popularities;
  poster: string;
  director: any[];
  writer: string[];
  background: string;
  logo: string;
  trailers: Trailer[];
  popularity: number;
  id: string;
  videos?: Video[];
  genres: string[];
  releaseInfo: string;
  trailerStreams: TrailerStream[];
  links: Link[];
  behaviorHints: BehaviorHints;
}

export interface BehaviorHints {
  defaultVideoId: null;
  hasScheduledVideos: boolean;
}

export interface Link {
  name: string;
  category: string;
  url: string;
}

export interface Popularities {
  moviedb: number;
  stremio: number;
  stremio_lib: number;
  trakt: number;
}

export interface TrailerStream {
  title: string;
  ytId: string;
}

export interface Trailer {
  source: string;
  type: string;
}

export interface Video {
  name: string;
  season: number;
  number: number;
  firstAired: Date;
  tvdb_id: number;
  rating: number;
  overview: string;
  thumbnail: string;
  id: string;
  released: Date;
  episode: number;
  description: string;
}
