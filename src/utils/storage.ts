import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Playlist, Track } from "../types/music";

const KEYS = {
  queue: "@lm/queue",
  favourites: "@lm/favourites",
  recent: "@lm/recent",
  downloaded: "@lm/downloaded",
  searchHistory: "@lm/searchHistory",
  playlists: "@lm/playlists",
  download: (id: string) => `@lm/dl/${id}`,
} as const;

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function save(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const loadQueue = () => load<Track[]>(KEYS.queue, []);
export const saveQueue = (q: Track[]) => save(KEYS.queue, q);

export const loadFavourites = () => load<Track[]>(KEYS.favourites, []);
export const saveFavourites = (f: Track[]) => save(KEYS.favourites, f);

export const loadRecent = () => load<Track[]>(KEYS.recent, []);
export const saveRecent = (r: Track[]) => save(KEYS.recent, r.slice(0, 20));

export const loadDownloaded = () => load<Track[]>(KEYS.downloaded, []);
export const saveDownloaded = (d: Track[]) => save(KEYS.downloaded, d);

export async function getDownloadedUri(songId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.download(songId));
  } catch {
    return null;
  }
}

export async function setDownloadedUri(
  songId: string,
  uri: string,
): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.download(songId), uri);
  } catch {}
}

export const loadSearchHistory = () => load<string[]>(KEYS.searchHistory, []);
export const saveSearchHistory = (h: string[]) =>
  save(KEYS.searchHistory, h.slice(0, 20));

export const loadPlaylists = () => load<Playlist[]>(KEYS.playlists, []);
export const savePlaylists = (p: Playlist[]) => save(KEYS.playlists, p);
