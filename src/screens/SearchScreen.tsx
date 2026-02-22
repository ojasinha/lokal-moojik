import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArtistItem } from '../components/ArtistItem';
import { SongItem } from '../components/SongItem';
import type { RootStackParamList } from '../navigation/types';
import { searchAlbums, searchArtists, searchSongs } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import type { SearchAlbum, SearchArtist, Track } from '../types/music';
import { decodeHtmlEntities } from '../utils/html';
import { loadSearchHistory, saveSearchHistory } from '../utils/storage';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type FilterTab = 'Songs' | 'Artists' | 'Albums';
const TABS: FilterTab[] = ['Songs', 'Artists', 'Albums'];

const PLACEHOLDER_IMG = require('@/assets/images/icon.png');

function getAlbumImage(album: SearchAlbum): string {
  const imgs = album.image;
  if (!imgs?.length) return '';
  const x500 = imgs.find((i) => i.quality === '500x500');
  const x150 = imgs.find((i) => i.quality === '150x150');
  const picked = x500 ?? x150 ?? imgs[imgs.length - 1];
  return picked?.link ?? picked?.url ?? '';
}

export default function SearchScreen() {
  const colors = useAppColors();
  const nav = useNavigation<NavProp>();

  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('Songs');
  const [loading, setLoading] = useState(false);

  const [songResults, setSongResults] = useState<Track[]>([]);
  const [artistResults, setArtistResults] = useState<SearchArtist[]>([]);
  const [albumResults, setAlbumResults] = useState<SearchAlbum[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const inputRef = useRef<TextInput>(null);
  const { playSong, currentTrack, isPlaying } = usePlayerStore();

  // Load history on mount
  useEffect(() => {
    loadSearchHistory().then(setHistory);
  }, []);

  const hasResults =
    activeTab === 'Songs'
      ? songResults.length > 0
      : activeTab === 'Artists'
        ? artistResults.length > 0
        : albumResults.length > 0;

  const notFound = submittedQuery.length > 0 && !loading && !hasResults;

  const addToHistory = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const next = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 20);
      setHistory(next);
      saveSearchHistory(next);
    },
    [history],
  );

  const removeFromHistory = (term: string) => {
    const next = history.filter((h) => h !== term);
    setHistory(next);
    saveSearchHistory(next);
  };

  const clearHistory = () => {
    setHistory([]);
    saveSearchHistory([]);
  };

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setSubmittedQuery(trimmed);
      setLoading(true);
      addToHistory(trimmed);

      try {
        const [songs, artists, albums] = await Promise.all([
          searchSongs(trimmed, 1, 20).then((r) => r.tracks),
          searchArtists(trimmed).then((r) => r.artists),
          searchAlbums(trimmed).then((r) => r.albums),
        ]);
        setSongResults(songs);
        setArtistResults(artists);
        setAlbumResults(albums);
      } catch {
        setSongResults([]);
        setArtistResults([]);
        setAlbumResults([]);
      } finally {
        setLoading(false);
      }
    },
    [addToHistory],
  );

  // Debounce: fire search 450ms after the user stops typing
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSubmittedQuery('');
      setSongResults([]);
      setArtistResults([]);
      setAlbumResults([]);
      return;
    }
    const timer = setTimeout(() => runSearch(trimmed), 450);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleHistoryItem = (term: string) => {
    setQuery(term);
    runSearch(term);
  };

  const clearSearch = () => {
    setQuery('');
    setSubmittedQuery('');
    setSongResults([]);
    setArtistResults([]);
    setAlbumResults([]);
    inputRef.current?.focus();
  };

  const handleSongPress = useCallback(
    (track: Track) => {
      const idx = songResults.findIndex((t) => t.id === track.id);
      playSong(track, songResults, idx >= 0 ? idx : 0);
    },
    [songResults, playSong],
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  const isSearching = submittedQuery.length > 0 || query.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: ACCENT }]}>
          <Search size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Search songs, artists, albums…"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => { Keyboard.dismiss(); query.trim() && runSearch(query.trim()); }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* No search yet → show history */}
      {!isSearching ? (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Recent Searches</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={[styles.clearAll, { color: ACCENT }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={history}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.historyItem, { borderBottomColor: colors.border }]}
                onPress={() => handleHistoryItem(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.historyText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item}
                </Text>
                <TouchableOpacity onPress={() => removeFromHistory(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                Your search history will appear here.
              </Text>
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      ) : (
        <>
          {/* Filter Tabs */}
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && { backgroundColor: ACCENT },
                  activeTab !== tab && { borderColor: ACCENT, borderWidth: 1 },
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : ACCENT }]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loading */}
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={ACCENT} />
            </View>
          )}

          {/* Not Found */}
          {!loading && notFound && (
            <View style={styles.center}>
              <Text style={styles.notFoundEmoji}>😞</Text>
              <Text style={[styles.notFoundTitle, { color: colors.textPrimary }]}>Not Found</Text>
              <Text style={[styles.notFoundSub, { color: colors.textSecondary }]}>
                Sorry, the keyword you entered cannot be{'\n'}found, please check again or search with{'\n'}another keyword.
              </Text>
            </View>
          )}


          {/* Songs Results */}
          {!loading && activeTab === 'Songs' && songResults.length > 0 && (
            <FlatList
              data={songResults}
              keyExtractor={(t) => t.id}
              renderItem={({ item }) => (
                <SongItem
                  track={item}
                  isPlaying={currentTrack?.id === item.id && isPlaying}
                  onPress={() => handleSongPress(item)}
                />
              )}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* Artists Results */}
          {!loading && activeTab === 'Artists' && artistResults.length > 0 && (
            <FlatList
              data={artistResults}
              keyExtractor={(a) => a.id}
              renderItem={({ item }) => (
                <ArtistItem
                  artist={item}
                  onPress={() =>
                    nav.navigate('ArtistDetail', {
                      artistId: item.id,
                      artistName: item.name,
                    })
                  }
                />
              )}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* Albums Results */}
          {!loading && activeTab === 'Albums' && albumResults.length > 0 && (
            <FlatList
              data={albumResults}
              keyExtractor={(a) => a.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.albumRow}
                  onPress={() =>
                    nav.navigate('AlbumDetail', {
                      albumId: item.id,
                      albumName: item.name,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Image
                    source={getAlbumImage(item) ? { uri: getAlbumImage(item) } : PLACEHOLDER_IMG}
                    style={styles.albumArt}
                    contentFit="cover"
                  />
                  <View style={styles.albumInfo}>
                    <Text style={[styles.albumName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {decodeHtmlEntities(item.name)}
                    </Text>
                    <Text style={[styles.albumSub, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.primaryArtists ?? item.artist ?? ''}
                      {item.year ? `  ·  ${item.year}` : ''}
                    </Text>
                    {item.songCount != null && (
                      <Text style={[styles.albumSub, { color: colors.textSecondary }]}>
                        {item.songCount} songs
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  backBtn: { padding: 2 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  searchIcon: { marginRight: 2 },
  input: { flex: 1, fontSize: 14, paddingVertical: 0 },

  // History
  historyContainer: { flex: 1, paddingTop: 4 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyTitle: { fontSize: 16, fontWeight: '600' },
  clearAll: { fontSize: 13, fontWeight: '500' },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyText: { fontSize: 14, flex: 1, marginRight: 8 },
  emptyHint: { textAlign: 'center', marginTop: 32, fontSize: 13 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: { fontSize: 13, fontWeight: '600' },

  // Not Found
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  notFoundEmoji: { fontSize: 72, marginBottom: 16 },
  notFoundTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  notFoundSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // List
  listContent: { paddingBottom: 20 },

  // Album row
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  albumArt: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#333' },
  albumInfo: { flex: 1 },
  albumName: { fontSize: 14, fontWeight: '500' },
  albumSub: { fontSize: 12, marginTop: 2 },
});
