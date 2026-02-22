import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation } from '@react-navigation/native';
import { ListMusic, Pause, Play, Repeat, Repeat1, RotateCcw, RotateCw, Shuffle, SkipBack, SkipForward } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { RepeatMode } from '../store/playerStore';
import { usePlayerStore } from '../store/playerStore';

function RepeatIcon({ mode, colors }: { mode: RepeatMode; colors: any }) {
  const active = mode !== 'none';
  const color = active ? ACCENT : colors.textPrimary;
  return (
    <View>
      {mode === 'one'
        ? <Repeat1 size={22} color={color} />
        : <Repeat size={22} color={color} />}
    </View>
  );
}

export function PlayerControls() {
  const colors = useAppColors();
  const nav = useNavigation();
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const playNext = usePlayerStore((s) => s.playNext);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const position = usePlayerStore((s) => s.position);

  return (
    <View>
      {/* Main control row: prev | -10s | play/pause | +10s | next */}
      <View style={styles.mainRow}>
        <TouchableOpacity onPress={playPrev} hitSlop={HIT}>
        <SkipBack size={38} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => seekTo(Math.max(0, position - 10))} hitSlop={HIT}>
          <RotateCcw size={32} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlay}
          style={styles.playBtn}
          activeOpacity={0.85}
        >
          {isPlaying
            ? <Pause size={40} color={colors.background} />
            : <Play size={40} color={colors.background} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => seekTo(position + 10)} hitSlop={HIT}>
          <RotateCw size={32} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} hitSlop={HIT}>
          <SkipForward size={38} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Secondary row: shuffle | queue | repeat */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity onPress={toggleShuffle} hitSlop={HIT}>
          <Shuffle size={22} color={shuffle ? ACCENT : colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => nav.navigate('Queue' as never)} hitSlop={HIT}>
          <ListMusic size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={cycleRepeat} hitSlop={HIT}>
          <RepeatIcon mode={repeat} colors={colors} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HIT = { top: 12, bottom: 12, left: 12, right: 12 };

const styles = StyleSheet.create({
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
});
