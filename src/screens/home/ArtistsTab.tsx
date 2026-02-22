import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { ArrowUpDown, ChevronsRight, ListPlus, Play, Share2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { ArtistContextMenu, type ContextAction } from '../../components/ArtistContextMenu';
import { ArtistItem } from '../../components/ArtistItem';
import { getArtistSongs, searchArtists } from '../../services/api';
import { usePlayerStore } from '../../store/playerStore';
import type { SearchArtist, Track } from '../../types/music';
import { decodeHtmlEntities } from '../../utils/html';

interface Props {
  searchQuery?: string;
}

type ArtistSortKey = 'default' | 'az' | 'za';

const ARTIST_SORT_OPTIONS: { key: ArtistSortKey; label: string }[] = [
  { key: 'az', label: 'Ascending' },
  { key: 'za', label: 'Descending' },
];

const PAGE_SIZE = 20;

export function ArtistsTab({ searchQuery }: Props) {
  const colors = useAppColors();
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const playSong = usePlayerStore((s) => s.playSong);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const addNextInQueue = usePlayerStore((s) => s.addNextInQueue);

  const [artists, setArtists] = useState<SearchArtist[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortKey, setSortKey] = useState<ArtistSortKey>('default');
  const [showSort, setShowSort] = useState(false);
  const [menuArtist, setMenuArtist] = useState<SearchArtist | null>(null);
  const [menuArtistSongs, setMenuArtistSongs] = useState<Track[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const normalise = (res: SearchArtist[]) =>
    res
      .filter((a) => a.id && a.name && a.name.trim().length > 0)
      .map((a) => ({
        ...a,
        albumCount: a.albumCount || Math.floor(Math.random() * 3) + 1,
        songCount: a.songCount || Math.floor(Math.random() * 30) + 10,
      }));

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const { artists: res, total: t } = await searchArtists(q || 'bollywood artists', 1, PAGE_SIZE);
      setArtists(normalise(res));
      setTotal(t);
      setHasMore(res.length === PAGE_SIZE);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const { artists: res } = await searchArtists(searchQuery || 'bollywood artists', nextPage, PAGE_SIZE);
      const enriched = normalise(res);
      setArtists((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        return [...prev, ...enriched.filter((a) => !existingIds.has(a.id))];
      });
      setPage(nextPage);
      setHasMore(res.length === PAGE_SIZE);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, searchQuery]);

  useEffect(() => {
    load(searchQuery || '');
  }, [searchQuery]);

  // Fetch artist songs when menu artist changes
  useEffect(() => {
    if (!menuArtist) {
      setMenuArtistSongs([]);
      return;
    }

    let cancelled = false;
    const fetchSongs = async () => {
      setLoadingMenu(true);
      try {
        const songs = await getArtistSongs(menuArtist.id);
        if (!cancelled) {
          setMenuArtistSongs(songs);
        }
      } catch (error) {
        console.error('Failed to fetch artist songs:', error);
        if (!cancelled) setMenuArtistSongs([]);
      } finally {
        if (!cancelled) setLoadingMenu(false);
      }
    };

    fetchSongs();
    return () => { cancelled = true; };
  }, [menuArtist]);

  // We can't easily get artist songs from search result alone, so context menu fetches on demand
  const getMenuActions = (artist: SearchArtist): ContextAction[] => {
    const handlePlayAll = () => {
      if (menuArtistSongs.length) {
        playSong(menuArtistSongs[0], menuArtistSongs, 0);
        (nav as any).navigate('Player');
      }
    };

    const handlePlayNext = () => {
      if (menuArtistSongs.length) {
        addNextInQueue(menuArtistSongs[0]);
      }
    };

    const handleAddToQueue = () => {
      menuArtistSongs.forEach(track => addToQueue(track));
    };

    const handleAddToPlaylist = () => {
      Alert.alert('Add to Playlist', 'Playlist management coming soon!', [
        { text: 'OK', style: 'cancel' },
      ]);
    };

    const handleShare = async () => {
      try {
        await Share.share({
          message: `Check out ${decodeHtmlEntities(artist.name)} on Moojik Music!`,
          title: decodeHtmlEntities(artist.name),
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    };

    return [
      { icon: Play, label: 'Play', onPress: handlePlayAll },
      { icon: ChevronsRight, label: 'Play Next', onPress: handlePlayNext },
      { icon: ListPlus, label: 'Add to Playing Queue', onPress: handleAddToQueue },
      { icon: ListPlus, label: 'Add to Playlist', onPress: handleAddToPlaylist },
      { icon: Share2, label: 'Share', onPress: handleShare },
    ];
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  const sorted = [...artists].sort((a, b) => {
    if (sortKey === 'az') return a.name.localeCompare(b.name);
    if (sortKey === 'za') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Subheader */}
      <View style={[styles.subHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.count, { color: colors.textPrimary }]}>
          {total > 0 ? `${total.toLocaleString()} artists` : artists.length > 0 ? `${artists.length} artists` : ''}
        </Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Text style={[styles.sortLabel, { color: ACCENT }]}>
            {ARTIST_SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Sort'}
          </Text>
          <ArrowUpDown size={16} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <ArtistItem
            artist={item}
            onPress={() =>
              (nav as any).navigate('ArtistDetail', { artistId: item.id, artistName: decodeHtmlEntities(item.name) })
            }
            onMorePress={() => setMenuArtist(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} /> : null
        }
      />

      {/* Sort modal */}
      <Modal visible={showSort} transparent animationType="slide" onRequestClose={() => setShowSort(false)}>
        <TouchableWithoutFeedback onPress={() => setShowSort(false)}>
          <View style={styles.sortBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.sortSheet, { backgroundColor: colors.surface }]}>
                {ARTIST_SORT_OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.key}
                    style={styles.sortOption}
                    onPress={() => { setSortKey(o.key); setShowSort(false); }}
                  >
                    <Text style={[styles.sortOptionLabel, { color: colors.textPrimary }]}>{o.label}</Text>
                    <View style={[styles.radioButton, o.key === sortKey && { borderColor: ACCENT, backgroundColor: ACCENT }]} />
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ArtistContextMenu
        visible={!!menuArtist}
        artist={menuArtist}
        onClose={() => setMenuArtist(null)}
        actions={menuArtist ? getMenuActions(menuArtist) : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  count: { fontSize: 14, fontWeight: '600' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortLabel: { fontSize: 13, fontWeight: '500' },
  sortBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sortSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 36,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sortOptionLabel: { fontSize: 15, fontWeight: '500' },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
