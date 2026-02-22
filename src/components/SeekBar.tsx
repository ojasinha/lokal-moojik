import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatSeconds } from '../utils/time';

interface Props {
  position: number; // seconds
  duration: number; // seconds
  onSeek: (secs: number) => void;
}

export function SeekBar({ position, duration, onSeek }: Props) {
  const colors = useAppColors();
  const value = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onSlidingComplete={(v) => onSeek(v * duration)}
        minimumTrackTintColor={ACCENT}
        maximumTrackTintColor={colors.border}
        thumbTintColor={ACCENT}
      />
      <View style={styles.labels}>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {formatSeconds(position)}
        </Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {formatSeconds(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: 4,
  },
  time: {
    fontSize: 12,
  },
});
