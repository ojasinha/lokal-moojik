import type {
  AlbumDetail,
  ArtistDetail,
  RawSearchSong,
  RawSong,
  SearchAlbum,
  SearchArtist,
  Track,
} from "../types/music";

const BASE = "https://saavn.sumit.co";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bestImageUrl(
  arr?: { quality: string; link?: string; url?: string }[],
): string {
  if (!arr?.length) return "";
  const x500 = arr.find((x) => x.quality === "500x500");
  const x150 = arr.find((x) => x.quality === "150x150");
  const picked = x500 ?? x150 ?? arr[arr.length - 1];
  return picked?.link ?? picked?.url ?? "";
}

function audioUrl(
  arr: { quality: string; link?: string; url?: string }[],
  preferred = "160kbps",
): string {
  if (!arr?.length) return "";
  const pick =
    arr.find((x) => x.quality === preferred) ??
    arr.find((x) => x.quality === "96kbps") ??
    arr[arr.length - 1];
  return pick?.link ?? pick?.url ?? "";
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API ${res.status} – ${path}`);
  return res.json() as Promise<T>;
}

// ─── Normalisation ────────────────────────────────────────────────────────────

export function normaliseSearchSong(s: RawSearchSong): Track {
  return {
    id: s.id,
    name: s.name,
    durationSecs: parseInt(s.duration, 10) || 0,
    primaryArtists: s.primaryArtists ?? "",
    primaryArtistsId: s.primaryArtistsId ?? "",
    album: { id: s.album?.id ?? "", name: s.album?.name ?? "" },
    artwork: bestImageUrl(s.image),
    audioUrl: audioUrl(s.downloadUrl, "160kbps"),
    audioUrl320: audioUrl(s.downloadUrl, "320kbps"),
  };
}

export function normaliseRawSong(s: RawSong): Track {
  return {
    id: s.id,
    name: s.name,
    durationSecs: s.duration || 0,
    primaryArtists: s.artists?.primary?.map((a) => a.name).join(", ") ?? "",
    album: { id: s.album?.id ?? "", name: s.album?.name ?? "" },
    artwork: bestImageUrl(s.image),
    audioUrl: audioUrl(s.downloadUrl, "160kbps"),
    audioUrl320: audioUrl(s.downloadUrl, "320kbps"),
  };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchSongs(
  query: string,
  page = 1,
  limit = 20,
): Promise<{ tracks: Track[]; total: number }> {
  const data = await apiFetch<any>(
    `/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
  );
  const results: RawSearchSong[] = data?.data?.results ?? [];
  return {
    tracks: results.map(normaliseSearchSong),
    total: data?.data?.total ?? 0,
  };
}

export async function searchArtists(query: string): Promise<SearchArtist[]> {
  const data = await apiFetch<any>(
    `/api/search/artists?query=${encodeURIComponent(query)}`,
  );
  return data?.data?.results ?? [];
}

export async function searchAlbums(query: string): Promise<SearchAlbum[]> {
  const data = await apiFetch<any>(
    `/api/search/albums?query=${encodeURIComponent(query)}`,
  );
  return data?.data?.results ?? [];
}

// ─── Song detail ──────────────────────────────────────────────────────────────

export async function getSongById(id: string): Promise<Track | null> {
  const data = await apiFetch<any>(`/api/songs/${id}`);
  const songs: RawSong[] = data?.data ?? [];
  return songs.length ? normaliseRawSong(songs[0]) : null;
}

export async function getSongSuggestions(id: string): Promise<Track[]> {
  const data = await apiFetch<any>(`/api/songs/${id}/suggestions`);
  const songs: RawSong[] = data?.data ?? [];
  return songs.map(normaliseRawSong);
}

// ─── Artist ───────────────────────────────────────────────────────────────────

export async function getArtist(id: string): Promise<ArtistDetail | null> {
  const data = await apiFetch<any>(`/api/artists/${id}`);
  return data?.data ?? null;
}

export async function getArtistSongs(id: string): Promise<Track[]> {
  const data = await apiFetch<any>(`/api/artists/${id}/songs`);
  const raw: RawSong[] =
    data?.data?.songs ?? data?.data?.results ?? data?.data ?? [];
  return raw.map(normaliseRawSong);
}

// ─── Album ────────────────────────────────────────────────────────────────────

export async function getAlbum(id: string): Promise<AlbumDetail | null> {
  const data = await apiFetch<any>(`/api/albums?id=${id}`);
  return data?.data ?? null;
}
