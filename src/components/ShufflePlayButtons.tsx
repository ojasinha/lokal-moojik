import { ACCENT } from '@/constants/theme';
import { Play, Shuffle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onShuffle: () => void;
  onPlay: () => void;
}

export function ShufflePlayButtons({ onShuffle, onPlay }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={onShuffle} activeOpacity={0.8}>
        <Shuffle size={18} color={ACCENT} />
        <Text style={[styles.label, { color: ACCENT }]}>Shuffle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.playBtn]} onPress={onPlay} activeOpacity={0.8}>
        <Play size={18} color="#fff" />
        <Text style={[styles.label, { color: '#fff' }]}>Play</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  btn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: ACCENT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  playBtn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
