// ─── Raw API shapes ───────────────────────────────────────────────────────────

/** Song object returned by /api/search/songs */
export interface RawSearchSong {
  id: string;
  name: string;
  album: { id: string; name: string; url: string };
  year: string;
  releaseDate: string | null;
  duration: string; // string in search API
  label: string;
  primaryArtists: string;
  primaryArtistsId: string;
  featuredArtists: string;
  explicitContent: number;
  playCount: string;
  language: string;
  hasLyrics: string;
  url: string;
  image: { quality: string; link: string }[];
  downloadUrl: { quality: string; link: string }[];
}

/** Song object returned by /api/songs/{id} */
export interface RawSong {
  id: string;
  name: string;
  duration: number; // number in songs API
  language: string;
  album: { id: string; name: string; url?: string };
  artists: {
    primary: { id: string; name: string; role?: string }[];
    featured?: { id: string; name: string }[];
    all?: { id: string; name: string }[];
  };
  image: { quality: string; url: string }[];
  downloadUrl: { quality: string; url: string }[];
}

// ─── Normalised Track (used everywhere in the app) ────────────────────────────

export interface Track {
  id: string;
  name: string;
  durationSecs: number;
  primaryArtists: string;
  primaryArtistsId?: string; // comma-separated artist IDs
  album: { id: string; name: string };
  artwork: string; // 500x500 image URL
  audioUrl: string; // 160kbps or best available
  audioUrl320?: string; // 320kbps when available
}

// ─── Search result shapes ─────────────────────────────────────────────────────

export interface SearchArtist {
  id: string;
  name: string;
  type?: string;
  image?: { quality: string; link?: string; url?: string }[];
  followerCount?: number | string;
  isVerified?: boolean;
  albumCount?: number | string;
  songCount?: number | string;
}

export interface SearchAlbum {
  id: string;
  name: string;
  artist?: string;
  primaryArtists?: string;
  year?: string;
  songCount?: number | string;
  image?: { quality: string; link?: string; url?: string }[];
  url?: string;
}

// ─── Detail shapes ────────────────────────────────────────────────────────────

export interface ArtistDetail {
  id: string;
  name: string;
  image?: { quality: string; url?: string; link?: string }[];
  bio?: string | { text: string; title: string; sequence: string }[];
  followerCount?: number | string;
  albumCount?: number | string;
  availableLanguages?: string[];
  isVerified?: boolean;
  topSongs?: RawSong[];
}

export interface AlbumDetail {
  id: string;
  name: string;
  primaryArtists?: string;
  artist?: string;
  year?: string;
  songCount?: number | string;
  duration?: number | string;
  image?: { quality: string; url?: string; link?: string }[];
  songs?: RawSong[];
}
