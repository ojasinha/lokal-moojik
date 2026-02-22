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
import { decodeHtmlEntities } from '../utils/html';

const HEIGHT = 72;
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
      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
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
            {decodeHtmlEntities(currentTrack.name)}
          </Text>
          <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
            {decodeHtmlEntities(currentTrack.primaryArtists)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={(e) => { e.stopPropagation(); playPrev(); }}
          >
            <SkipBack size={22} color={colors.textSecondary} fill={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playBtn}
            onPress={(e) => { e.stopPropagation(); togglePlay(); }}
            activeOpacity={0.8}
          >
            {isPlaying
              ? <Pause size={20} color="#fff" fill="#fff" />
              : <Play size={20} color="#fff" fill="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={(e) => { e.stopPropagation(); playNext(); }}
          >
            <SkipForward size={22} color={colors.textSecondary} fill={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  progressBg: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: 3,
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  art: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  artist: {
    fontSize: 12,
    marginTop: 3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipBtn: {
    padding: 10,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
});
