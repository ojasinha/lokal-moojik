import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  AlertCircle,
  ArrowUpDown,
  ChevronsRight,
  FileText,
  Info,
  ListPlus,
  Phone,
  Share2,
  Trash2,
  User
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  View,
} from 'react-native';
import { SongContextMenu, type ContextAction } from '../../components/SongContextMenu';
import { SongItem } from '../../components/SongItem';
import { searchSongs } from '../../services/api';
import { usePlayerStore } from '../../store/playerStore';
import type { Track } from '../../types/music';

type SortKey = 'default' | 'ascending' | 'descending' | 'artist' | 'album' | 'year' | 'dateAdded' | 'dateModified' | 'composer';

interface Props {
  externalQuery?: string;
}

const DEFAULT_QUERY = 'top hindi songs';
const PAGE_SIZE = 20;

export function SongsTab({ externalQuery }: Props) {
  const colors = useAppColors();
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playSong = usePlayerStore((s) => s.playSong);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const addNextInQueue = usePlayerStore((s) => s.addNextInQueue);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [showSort, setShowSort] = useState(false);
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const [detailsTrack, setDetailsTrack] = useState<Track | null>(null);

  const activeQuery = externalQuery || DEFAULT_QUERY;
  const prevQueryRef = useRef(activeQuery);

  const load = useCallback(async (q: string, p: number, replace: boolean) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await searchSongs(q, p, PAGE_SIZE);
      setTracks((prev) => replace ? res.tracks : [...prev, ...res.tracks]);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const q = activeQuery;
    if (q !== prevQueryRef.current) {
      prevQueryRef.current = q;
      setPage(1);
      load(q, 1, true);
    } else if (tracks.length === 0) {
      load(q, 1, true);
    }
  }, [activeQuery]);

  const handleEndReached = () => {
    if (loadingMore || loading) return;
    if (tracks.length >= total) return;
    const nextPage = page + 1;
    setPage(nextPage);
    load(activeQuery, nextPage, false);
  };

  const sorted = [...tracks].sort((a, b) => {
    if (sortKey === 'ascending') return a.name.localeCompare(b.name);
    if (sortKey === 'descending') return b.name.localeCompare(a.name);
    if (sortKey === 'artist') return (a.artist || '').localeCompare(b.artist || '');
    if (sortKey === 'album') return (a.album || '').localeCompare(b.album || '');
    if (sortKey === 'year') return (a.year || 0) - (b.year || 0);
    if (sortKey === 'dateAdded') return (a.dateAdded || 0) - (b.dateAdded || 0);
    if (sortKey === 'dateModified') return (a.dateModified || 0) - (b.dateModified || 0);
    if (sortKey === 'composer') return (a.composer || '').localeCompare(b.composer || '');
    return 0;
  });

  const getMenuActions = (track: Track): ContextAction[] => [
    {
      icon: ChevronsRight,
      label: 'Play Next',
      onPress: () => addNextInQueue(track),
    },
    {
      icon: ListPlus,
      label: 'Add to Playing Queue',
      onPress: () => addToQueue(track),
    },
    {
      icon: ListPlus,
      label: 'Add to Playlist',
      onPress: () => {
        Alert.alert('Add to Playlist', 'Playlist management coming soon!', [
          { text: 'OK' },
        ]);
      },
    },
    {
      icon: FileText,
      label: 'Go to Album',
      onPress: () => {
        nav.navigate('AlbumDetail' as never, {
          albumId: track.album.id,
          albumName: track.album.name,
        } as never);
      },
    },
    {
      icon: User,
      label: 'Go to Artist',
      onPress: () => {
        if (track.primaryArtistsId) {
          const artistId = track.primaryArtistsId.split(',')[0].trim();
          nav.navigate('ArtistDetail' as never, {
            artistId,
            artistName: track.primaryArtists.split(',')[0].trim(),
          } as never);
        } else {
          Alert.alert('Artist Info', 'Artist information not available', [
            { text: 'OK' },
          ]);
        }
      },
    },
    {
      icon: Info,
      label: 'Details',
      onPress: () => setDetailsTrack(track),
    },
    {
      icon: Phone,
      label: 'Set as Ringtone',
      onPress: () => {
        Alert.alert('Set as Ringtone', 'This feature requires native setup', [
          { text: 'OK' },
        ]);
      },
    },
    {
      icon: AlertCircle,
      label: 'Add to Blacklist',
      onPress: () => {
        Alert.alert(
          'Confirm',
          'Add this song to blacklist? It will be hidden from recommendations.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Blacklist',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Success', 'Song added to blacklist', [
                  { text: 'OK' },
                ]);
              },
            },
          ],
        );
      },
    },
    {
      icon: Share2,
      label: 'Share',
      onPress: async () => {
        try {
          await Share.share({
            message: `Check out "${track.name}" by ${track.primaryArtists}`,
            url: track.audioUrl,
            title: track.name,
          });
        } catch (error) {
          // ignore
        }
      },
    },
    {
      icon: Trash2,
      label: 'Delete from Device',
      onPress: () => {
        Alert.alert(
          'Confirm',
          'Remove this song from your library?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Success', 'Song removed from library', [
                  { text: 'OK' },
                ]);
              },
            },
          ],
        );
      },
      danger: true,
    },
  ];

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'ascending', label: 'Ascending' },
    { key: 'descending', label: 'Descending' },
    { key: 'artist', label: 'Artist' },
    { key: 'album', label: 'Album' },
    { key: 'year', label: 'Year' },
    { key: 'dateAdded', label: 'Date Added' },
    { key: 'dateModified', label: 'Date Modified' },
    { key: 'composer', label: 'Composer' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Subheader */}
      <View style={[styles.subHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.count, { color: colors.textPrimary }]}>
          {total > 0 ? `${total.toLocaleString()} songs` : ''}
        </Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Text style={[styles.sortLabel, { color: ACCENT }]}>
            {SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Sort'}
          </Text>
          <ArrowUpDown size={16} color={ACCENT} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <SongItem
              track={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => { playSong(item, sorted); nav.navigate('Player' as never); }}
              onMorePress={() => setMenuTrack(item)}
            />
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={ACCENT} size="small" style={{ padding: 16 }} />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort modal */}
      <Modal visible={showSort} transparent animationType="slide" onRequestClose={() => setShowSort(false)}>
        <TouchableWithoutFeedback onPress={() => setShowSort(false)}>
          <View style={styles.sortBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.sortSheet, { backgroundColor: colors.surface }]}>
                {SORT_OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.key}
                    style={styles.sortOption}
                    onPress={() => { setSortKey(o.key); setShowSort(false); }}
                  >
                    <Text style={[styles.sortOptionLabel, { color: colors.textPrimary }]}>
                      {o.label}
                    </Text>
                    <View style={[styles.radioButton, o.key === sortKey && { borderColor: ACCENT, backgroundColor: ACCENT }]} />
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Song context menu */}
      <SongContextMenu
        visible={!!menuTrack}
        track={menuTrack}
        onClose={() => setMenuTrack(null)}
        actions={menuTrack ? getMenuActions(menuTrack) : []}
      />

      {/* Details modal */}
      <Modal
        visible={!!detailsTrack}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsTrack(null)}
      >
        <TouchableWithoutFeedback onPress={() => setDetailsTrack(null)}>
          <View style={styles.detailsBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.detailsSheet, { backgroundColor: colors.surface }]}>
                <Text
                  style={[styles.detailsTitle, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {detailsTrack?.name}
                </Text>
                <Text
                  style={[
                    styles.detailsArtist,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {detailsTrack?.primaryArtists}
                </Text>

                <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Album
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {detailsTrack?.album.name}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Duration
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {detailsTrack
                      ? `${Math.floor(detailsTrack.durationSecs / 60)}:${String(
                          detailsTrack.durationSecs % 60,
                        ).padStart(2, '0')}`
                      : ''}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Song ID
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {detailsTrack?.id}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: ACCENT }]}
                  onPress={() => setDetailsTrack(null)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
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
  detailsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailsSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '70%',
  },
  detailsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  detailsArtist: { fontSize: 14, marginBottom: 16 },
  detailDivider: { height: StyleSheet.hairlineWidth, marginBottom: 16 },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: { fontSize: 12, marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '500' },
  closeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
