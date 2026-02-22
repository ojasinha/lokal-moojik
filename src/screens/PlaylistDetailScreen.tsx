import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronsRight, ListMusic, ListPlus, Play, Shuffle, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { SongContextMenu, type ContextAction } from '../components/SongContextMenu';
import { SongItem } from '../components/SongItem';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';

export default function PlaylistDetailScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { playlistId } = route.params as { playlistId: string; playlistName: string };

  const downloadedTracks = usePlayerStore((s) => s.downloadedTracks);
  const favourites = usePlayerStore((s) => s.favourites);
  const playlists = usePlayerStore((s) => s.playlists);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playSong = usePlayerStore((s) => s.playSong);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const addNextInQueue = usePlayerStore((s) => s.addNextInQueue);
  const toggleFavourite = usePlayerStore((s) => s.toggleFavourite);
  const favouritesList = usePlayerStore((s) => s.favourites);
  const removeTrackFromPlaylist = usePlayerStore((s) => s.removeTrackFromPlaylist);

  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  const isBuiltIn = playlistId === 'downloaded' || playlistId === 'favourites';

  const tracks = useMemo(() => {
    if (playlistId === 'downloaded') return downloadedTracks;
    if (playlistId === 'favourites') return favourites;
    return playlists.find((p) => p.id === playlistId)?.tracks ?? [];
  }, [playlistId, downloadedTracks, favourites, playlists]);

  const handlePlayAll = () => {
    if (!tracks.length) return;
    playSong(tracks[0], tracks, 0);
    nav.navigate('Player');
  };

  const handleShuffle = () => {
    if (!tracks.length) return;
    const idx = Math.floor(Math.random() * tracks.length);
    playSong(tracks[idx], tracks, idx);
    nav.navigate('Player');
  };

  const getMenuActions = (track: Track): ContextAction[] => {
    const isFav = favouritesList.some((f) => f.id === track.id);
    const actions: ContextAction[] = [
      {
        icon: Play,
        label: 'Play',
        onPress: () => {
          playSong(track, tracks);
          nav.navigate('Player');
        },
      },
      { icon: ChevronsRight, label: 'Play Next', onPress: () => addNextInQueue(track) },
      { icon: ListPlus, label: 'Add to Queue', onPress: () => addToQueue(track) },
      {
        icon: ListMusic,
        label: 'Add to Playlist',
        onPress: () => setAddToPlaylistTrack(track),
      },
      {
        icon: Play,
        label: isFav ? 'Remove from Favourites' : 'Add to Favourites',
        onPress: () => toggleFavourite(track),
      },
    ];

    if (!isBuiltIn) {
      actions.push({
        icon: Trash2,
        label: 'Remove from Playlist',
        danger: true,
        onPress: () => {
          Alert.alert(
            'Remove Song',
            `Remove "${track.name}" from this playlist?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeTrackFromPlaylist(playlistId, track.id) },
            ],
          );
        },
      });
    }

    return actions;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Action bar */}
      <View style={[styles.actionBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.countLabel, { color: colors.textSecondary }]}>
          {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
        </Text>
        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceAlt }]}
            onPress={handleShuffle}
            disabled={tracks.length === 0}
          >
            <Shuffle size={18} color={ACCENT} />
            <Text style={[styles.actionBtnText, { color: ACCENT }]}>Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: ACCENT }]}
            onPress={handlePlayAll}
            disabled={tracks.length === 0}
          >
            <Play size={18} color="#fff" />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Play All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tracks.length === 0 ? (
        <View style={styles.empty}>
          <ListMusic size={60} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No songs yet
          </Text>
          {!isBuiltIn && (
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Add songs via the ⋮ menu on any song
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <SongItem
              track={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => {
                playSong(item, tracks);
                nav.navigate('Player');
              }}
              onMorePress={() => setMenuTrack(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SongContextMenu
        visible={!!menuTrack}
        track={menuTrack}
        onClose={() => setMenuTrack(null)}
        actions={menuTrack ? getMenuActions(menuTrack) : []}
      />

      <AddToPlaylistModal
        visible={!!addToPlaylistTrack}
        track={addToPlaylistTrack}
        onClose={() => setAddToPlaylistTrack(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countLabel: { fontSize: 13 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: 17, fontWeight: '600' },
  emptyHint: { fontSize: 13, textAlign: 'center' },
});
