import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/playerStore';

export default function SettingsScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();

  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView>
        <Text style={[styles.section, { color: colors.textSecondary }]}>Playback</Text>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Shuffle</Text>
            <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
              Play songs in random order
            </Text>
          </View>
          <Switch
            value={shuffle}
            onValueChange={toggleShuffle}
            trackColor={{ false: colors.border, true: ACCENT }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Repeat</Text>
            <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
              {repeat === 'none' ? 'Off' : repeat === 'one' ? 'Repeat current song' : 'Repeat all songs'}
            </Text>
          </View>
          <View style={[styles.repeatBadge, { borderColor: ACCENT }]}>
            <Text style={[styles.repeatText, { color: ACCENT }]} onPress={cycleRepeat}>
              {repeat === 'none' ? 'Off' : repeat === 'one' ? 'One' : 'All'}
            </Text>
          </View>
        </View>

        <Text style={[styles.section, { color: colors.textSecondary }]}>About</Text>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Version</Text>
            <Text style={[styles.rowSub, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>API</Text>
            <Text style={[styles.rowSub, { color: colors.textSecondary }]}>saavn.sumit.co</Text>
          </View>
        </View>
      </ScrollView>
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
  section: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 12, marginTop: 2 },
  repeatBadge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  repeatText: { fontSize: 13, fontWeight: '600' },
});
