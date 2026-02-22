import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { Image } from 'expo-image';
import { BarChart2, MoreVertical, Play } from 'lucide-react-native';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { Track } from '../types/music';
import { decodeHtmlEntities } from '../utils/html';

function formatMins(secs: number): string {
  if (!secs || isNaN(secs) || secs < 0) return '0:00 mins';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} mins`;
}

interface Props {
  track: Track;
  isPlaying?: boolean;
  onPress: () => void;
  onMorePress?: () => void;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function SongItem({ track, isPlaying, onPress, onMorePress }: Props) {
  const colors = useAppColors();

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Artwork */}
      <Image
        source={track.artwork ? { uri: track.artwork } : PLACEHOLDER}
        style={styles.art}
        contentFit="cover"
      />

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: isPlaying ? ACCENT : colors.textPrimary }]}
          numberOfLines={1}
        >
          {decodeHtmlEntities(track.name)}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {track.primaryArtists}
          {track.durationSecs ? `  |  ${formatMins(track.durationSecs)}` : ''}
        </Text>
      </View>

      {/* Playing indicator / play button / more */}
      <View style={styles.right}>
        {isPlaying && (
          <BarChart2 size={18} color={ACCENT} style={styles.eq} />
        )}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={onPress}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Play size={14} color="#fff" fill="#fff" />
        </TouchableOpacity>
        {onMorePress && (
          <TouchableOpacity onPress={onMorePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 0 }}>
            <MoreVertical size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  art: {
    width: 62,
    height: 62,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eq: {
    marginRight: 2,
  },
});
