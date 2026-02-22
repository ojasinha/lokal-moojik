import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { ArrowUpDown } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AlbumCard } from '../../components/AlbumCard';
import { searchAlbums } from '../../services/api';
import type { SearchAlbum } from '../../types/music';
import { decodeHtmlEntities } from '../../utils/html';

interface Props {
  searchQuery?: string;
}

type AlbumSortKey = 'default' | 'az' | 'za' | 'yearNewest' | 'yearOldest' | 'dateAdded' | 'dateModified' | 'composer';

const ALBUM_SORT_OPTIONS: { key: AlbumSortKey; label: string }[] = [
  { key: 'az', label: 'Ascending' },
  { key: 'za', label: 'Descending' },
  { key: 'yearNewest', label: 'Year (Newest)' },
  { key: 'yearOldest', label: 'Year (Oldest)' },
  { key: 'dateAdded', label: 'Date Added' },
  { key: 'dateModified', label: 'Date Modified' },
  { key: 'composer', label: 'Composer' },
];

const PAGE_SIZE = 20;

export function AlbumsTab({ searchQuery }: Props) {
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useAppColors();

  const [albums, setAlbums] = useState<SearchAlbum[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortKey, setSortKey] = useState<AlbumSortKey>('default');
  const [showSort, setShowSort] = useState(false);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      const { albums: res, total: t } = await searchAlbums(q || 'bollywood', 1, PAGE_SIZE);
      setAlbums(res);
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
      const { albums: res } = await searchAlbums(searchQuery || 'bollywood', nextPage, PAGE_SIZE);
      setAlbums((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        return [...prev, ...res.filter((a) => !existingIds.has(a.id))];
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  const sorted = [...albums].sort((a, b) => {
    if (sortKey === 'az') return (a.name ?? '').localeCompare(b.name ?? '');
    if (sortKey === 'za') return (b.name ?? '').localeCompare(a.name ?? '');
    if (sortKey === 'yearNewest') return Number(b.year ?? 0) - Number(a.year ?? 0);
    if (sortKey === 'yearOldest') return Number(a.year ?? 0) - Number(b.year ?? 0);
    if (sortKey === 'dateAdded') return Number(a.year ?? 0) - Number(b.year ?? 0);
    if (sortKey === 'dateModified') return Number(b.year ?? 0) - Number(a.year ?? 0);
    if (sortKey === 'composer') return (a.primaryArtists ?? '').localeCompare(b.primaryArtists ?? '');
    return 0;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Subheader */}
      <View style={[styles.subHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.count, { color: colors.textPrimary }]}>
          {total > 0 ? `${total.toLocaleString()} albums` : albums.length > 0 ? `${albums.length} albums` : ''}
        </Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Text style={[styles.sortLabel, { color: ACCENT }]}>
            {ALBUM_SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Sort'}
          </Text>
          <ArrowUpDown size={16} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(a) => a.id}
        numColumns={2}
        renderItem={({ item }) => (
          <AlbumCard
            album={item}
            onPress={() =>
              (nav as any).navigate('AlbumDetail', { albumId: item.id, albumName: decodeHtmlEntities(item.name) })
            }
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: tabBarHeight + 8 }}
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
                {ALBUM_SORT_OPTIONS.map((o) => (
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
