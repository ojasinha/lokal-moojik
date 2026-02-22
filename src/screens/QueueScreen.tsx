import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { Image } from 'expo-image';
import { ChevronDown, ChevronUp, ListMusic, X } from 'lucide-react-native';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';
import { decodeHtmlEntities } from '../utils/html';
import { formatSeconds } from '../utils/time';

const PLACEHOLDER = require('@/assets/images/icon.png');

export default function QueueScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const moveUp = usePlayerStore((s) => s.moveUp);
  const moveDown = usePlayerStore((s) => s.moveDown);
  const playSong = usePlayerStore((s) => s.playSong);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const renderItem = ({ item, index }: { item: Track; index: number }) => {
    const isPlaying = index === currentIndex;
    return (
      <View style={[styles.row, { backgroundColor: isPlaying ? colors.surfaceAlt : 'transparent' }]}>
        {/* Artwork */}
        <TouchableOpacity onPress={() => playSong(item, queue, index)}>
          <Image
            source={item.artwork ? { uri: item.artwork } : PLACEHOLDER}
            style={styles.art}
            contentFit="cover"
          />
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: isPlaying ? ACCENT : colors.textPrimary }]}
            numberOfLines={1}
          >
            {decodeHtmlEntities(item.name)}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
            {decodeHtmlEntities(item.primaryArtists)}
            {item.durationSecs ? `  ·  ${formatSeconds(item.durationSecs)}` : ''}
          </Text>
        </View>

        {/* Reorder */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => moveUp(index)} hitSlop={HIT}>
            <ChevronUp size={22} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveDown(index)} hitSlop={HIT}>
            <ChevronDown size={22} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeFromQueue(index)} hitSlop={HIT}>
            <X size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {queue.length === 0 ? (
        <View style={styles.empty}>
          <ListMusic size={60} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Queue is empty
          </Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.header, { color: colors.textSecondary }]}>
              {queue.length} song{queue.length !== 1 ? 's' : ''} in queue
            </Text>
          }
        />
      )}
    </View>
  );
}

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 13, paddingHorizontal: 16, paddingVertical: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  art: {
    width: 46,
    height: 46,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '500' },
  meta: { fontSize: 12, marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16 },
});
