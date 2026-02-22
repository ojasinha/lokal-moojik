import { useAppColors } from '@/hooks/use-app-colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { ChevronsRight, Heart, ListPlus, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SongContextMenu, type ContextAction } from '../components/SongContextMenu';
import { SongItem } from '../components/SongItem';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';

export default function FavouritesScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const nav = useNavigation();

  const favourites = usePlayerStore((s) => s.favourites);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playSong = usePlayerStore((s) => s.playSong);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const addNextInQueue = usePlayerStore((s) => s.addNextInQueue);
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);

  const getMenuActions = (track: Track): ContextAction[] => [
    { icon: Play, label: 'Play', onPress: () => { playSong(track, favourites); nav.navigate('Player' as never); } },
    { icon: ChevronsRight, label: 'Play Next', onPress: () => addNextInQueue(track) },
    { icon: ListPlus, label: 'Add to Queue', onPress: () => addToQueue(track) },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Favourites</Text>
      </View>

      {favourites.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={60} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No favourites yet
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
            Tap the heart icon on any song to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <SongItem
              track={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => { playSong(item, favourites); nav.navigate('Player' as never); }}
              onMorePress={() => setMenuTrack(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SongContextMenu
        visible={!!menuTrack}
        track={menuTrack}
        onClose={() => setMenuTrack(null)}
        actions={menuTrack ? getMenuActions(menuTrack) : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 22, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: 17, fontWeight: '600' },
  emptyHint: { fontSize: 13, textAlign: 'center' },
});
