import { create } from "zustand";
import type { Playlist, Track } from "../types/music";
import {
    loadDownloaded,
    loadFavourites,
    loadPlaylists,
    loadQueue,
    loadRecent,
    saveDownloaded,
    saveFavourites,
    savePlaylists,
    saveQueue,
    saveRecent,
} from "../utils/storage";

export type RepeatMode = "none" | "one" | "all";

interface PlayerState {
  // ── Playback ────────────────────────────────────────────────────────────────
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  position: number; // seconds
  duration: number; // seconds
  shuffle: boolean;
  repeat: RepeatMode;

  // ── Library ─────────────────────────────────────────────────────────────────
  favourites: Track[];
  recentlyPlayed: Track[];
  downloadedTracks: Track[];
  playlists: Playlist[];

  // ── Audio callbacks (set by AudioProvider) ──────────────────────────────────
  _onPlay: ((track: Track) => void) | null;
  _onTogglePlay: (() => void) | null;
  _onSeek: ((secs: number) => void) | null;

  // ── Actions ──────────────────────────────────────────────────────────────────
  playSong: (track: Track, queue?: Track[], index?: number) => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlay: () => void;
  seekTo: (secs: number) => void;

  addToQueue: (track: Track) => void;
  addNextInQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;

  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleFavourite: (track: Track) => void;
  isFavourite: (id: string) => boolean;
  addDownloadedTrack: (track: Track) => void;
  isDownloaded: (id: string) => boolean;

  // ── Playlists ────────────────────────────────────────────────────────────────
  createPlaylist: (name: string) => string;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;

  // ── Internal setters (called by AudioProvider) ───────────────────────────────
  _setPosition: (secs: number) => void;
  _setDuration: (secs: number) => void;
  _setIsPlaying: (val: boolean) => void;
  _registerCallbacks: (
    onPlay: (t: Track) => void,
    onToggle: () => void,
    onSeek: (s: number) => void,
  ) => void;

  // ── Hydration ────────────────────────────────────────────────────────────────
  hydrate: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: "none",
  favourites: [],
  recentlyPlayed: [],
  downloadedTracks: [],
  playlists: [],
  _onPlay: null,
  _onTogglePlay: null,
  _onSeek: null,

  // ── Playback actions ─────────────────────────────────────────────────────────

  playSong: (track, newQueue, idx) => {
    const q = newQueue ?? [...get().queue];
    // ensure track is in queue
    if (!q.some((t) => t.id === track.id)) q.unshift(track);
    const i = idx ?? q.findIndex((t) => t.id === track.id);

    const recent = [
      track,
      ...get().recentlyPlayed.filter((t) => t.id !== track.id),
    ].slice(0, 20);

    set({
      currentTrack: track,
      queue: q,
      currentIndex: i < 0 ? 0 : i,
      recentlyPlayed: recent,
    });
    saveQueue(q);
    saveRecent(recent);
    get()._onPlay?.(track);
  },

  playNext: () => {
    const { queue, currentIndex, shuffle, repeat, currentTrack } = get();
    if (!queue.length) return;

    if (repeat === "one" && currentTrack) {
      get()._onPlay?.(currentTrack);
      return;
    }

    let next: number;
    if (shuffle) {
      next = Math.floor(Math.random() * queue.length);
    } else {
      next = currentIndex + 1;
      if (next >= queue.length) {
        if (repeat === "all") next = 0;
        else return; // end of queue, stop
      }
    }

    const track = queue[next];
    set({ currentIndex: next, currentTrack: track });
    get()._onPlay?.(track);
  },

  playPrev: () => {
    const { queue, currentIndex, position } = get();
    if (!queue.length) return;

    // restart current song if more than 3s in
    if (position > 3) {
      get()._onSeek?.(0);
      return;
    }

    const prev = Math.max(0, currentIndex - 1);
    const track = queue[prev];
    set({ currentIndex: prev, currentTrack: track });
    get()._onPlay?.(track);
  },

  togglePlay: () => get()._onTogglePlay?.(),

  seekTo: (secs) => get()._onSeek?.(secs),

  // ── Queue actions ────────────────────────────────────────────────────────────

  addToQueue: (track) => {
    const q = [...get().queue, track];
    set({ queue: q });
    saveQueue(q);
  },

  addNextInQueue: (track) => {
    const q = [...get().queue];
    const insertAt = get().currentIndex + 1;
    q.splice(insertAt, 0, track);
    set({ queue: q });
    saveQueue(q);
  },

  removeFromQueue: (index) => {
    const q = [...get().queue];
    q.splice(index, 1);
    const cur = get().currentIndex;
    const newIdx = index < cur ? cur - 1 : Math.min(cur, q.length - 1);
    set({ queue: q, currentIndex: newIdx < 0 ? 0 : newIdx });
    saveQueue(q);
  },

  moveUp: (index) => {
    if (index <= 0) return;
    const q = [...get().queue];
    [q[index - 1], q[index]] = [q[index], q[index - 1]];
    const cur = get().currentIndex;
    const newIdx = cur === index ? index - 1 : cur === index - 1 ? index : cur;
    set({ queue: q, currentIndex: newIdx });
    saveQueue(q);
  },

  moveDown: (index) => {
    const q = [...get().queue];
    if (index >= q.length - 1) return;
    [q[index], q[index + 1]] = [q[index + 1], q[index]];
    const cur = get().currentIndex;
    const newIdx = cur === index ? index + 1 : cur === index + 1 ? index : cur;
    set({ queue: q, currentIndex: newIdx });
    saveQueue(q);
  },

  // ── Mode actions ─────────────────────────────────────────────────────────────

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  cycleRepeat: () => {
    const order: RepeatMode[] = ["none", "all", "one"];
    const next = order[(order.indexOf(get().repeat) + 1) % order.length];
    set({ repeat: next });
  },

  toggleFavourite: (track) => {
    const favs = get().favourites;
    const exists = favs.some((f) => f.id === track.id);
    const newFavs = exists
      ? favs.filter((f) => f.id !== track.id)
      : [track, ...favs];
    set({ favourites: newFavs });
    saveFavourites(newFavs);
  },

  isFavourite: (id) => get().favourites.some((f) => f.id === id),

  addDownloadedTrack: (track) => {
    const downloaded = get().downloadedTracks;
    if (!downloaded.some((d) => d.id === track.id)) {
      const newDownloaded = [track, ...downloaded];
      set({ downloadedTracks: newDownloaded });
      saveDownloaded(newDownloaded);
    }
  },

  isDownloaded: (id) => get().downloadedTracks.some((d) => d.id === id),

  // ── Playlist actions ─────────────────────────────────────────────────────────

  createPlaylist: (name) => {
    const id = `pl_${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      name,
      tracks: [],
      createdAt: Date.now(),
    };
    const updated = [...get().playlists, newPlaylist];
    set({ playlists: updated });
    savePlaylists(updated);
    return id;
  },

  deletePlaylist: (id) => {
    const updated = get().playlists.filter((p) => p.id !== id);
    set({ playlists: updated });
    savePlaylists(updated);
  },

  renamePlaylist: (id, name) => {
    const updated = get().playlists.map((p) =>
      p.id === id ? { ...p, name } : p,
    );
    set({ playlists: updated });
    savePlaylists(updated);
  },

  addTrackToPlaylist: (playlistId, track) => {
    const updated = get().playlists.map((p) => {
      if (p.id !== playlistId) return p;
      if (p.tracks.some((t) => t.id === track.id)) return p;
      return { ...p, tracks: [...p.tracks, track] };
    });
    set({ playlists: updated });
    savePlaylists(updated);
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    const updated = get().playlists.map((p) =>
      p.id !== playlistId
        ? p
        : { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) },
    );
    set({ playlists: updated });
    savePlaylists(updated);
  },

  // ── Internal ─────────────────────────────────────────────────────────────────

  _setPosition: (secs) => set({ position: secs }),
  _setDuration: (secs) => set({ duration: secs }),
  _setIsPlaying: (val) => set({ isPlaying: val }),

  _registerCallbacks: (onPlay, onToggle, onSeek) =>
    set({ _onPlay: onPlay, _onTogglePlay: onToggle, _onSeek: onSeek }),

  hydrate: async () => {
    const [queue, favourites, recentlyPlayed, downloadedTracks, playlists] =
      await Promise.all([
        loadQueue(),
        loadFavourites(),
        loadRecent(),
        loadDownloaded(),
        loadPlaylists(),
      ]);
    set({ queue, favourites, recentlyPlayed, downloadedTracks, playlists });
  },
}));
