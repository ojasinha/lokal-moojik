import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react-native';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';

const HEIGHT = 64;
const PLACEHOLDER = require('@/assets/images/icon.png');

export function MiniPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const playNext = usePlayerStore((s) => s.playNext);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const colors = useAppColors();
  const nav = useNavigation();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (position / duration) : 0;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={() => nav.navigate('Player')}
    >
      {/* Progress line */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: ACCENT }]} />
      </View>

      <View style={styles.row}>
        {/* Artwork */}
        <Image
          source={currentTrack.artwork ? { uri: currentTrack.artwork } : PLACEHOLDER}
          style={styles.art}
          contentFit="cover"
        />

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
            {currentTrack.primaryArtists}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); playPrev(); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
          >
            <SkipBack size={26} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); togglePlay(); }}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          >
            {isPlaying
              ? <Pause size={30} color={ACCENT} />
              : <Play size={30} color={ACCENT} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); playNext(); }}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
          >
            <SkipForward size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  progressBg: {
    height: 2,
    width: '100%',
  },
  progressFill: {
    height: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  art: {
    width: 42,
    height: 42,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
