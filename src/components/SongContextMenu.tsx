import { useAppColors } from '@/hooks/use-app-colors';
import { Image } from 'expo-image';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import type { Track } from '../types/music';

export interface ContextAction {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface Props {
  visible: boolean;
  track: Track | null;
  actions: ContextAction[];
  onClose: () => void;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function SongContextMenu({ visible, track, actions, onClose }: Props) {
  const colors = useAppColors();

  if (!track) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
              {/* Track preview */}
              <View style={styles.preview}>
                <Image
                  source={track.artwork ? { uri: track.artwork } : PLACEHOLDER}
                  style={styles.art}
                  contentFit="cover"
                />
                <View style={styles.previewInfo}>
                  <Text style={[styles.previewName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {track.name}
                  </Text>
                  <Text style={[styles.previewArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                    {track.primaryArtists}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {actions.map((action, i) => {
                const ActionIcon = action.icon;
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.actionRow}
                    onPress={() => { onClose(); action.onPress(); }}
                  >
                    <ActionIcon
                      size={22}
                      color={action.danger ? '#E53935' : colors.icon}
                    />
                    <Text
                      style={[
                        styles.actionLabel,
                        { color: action.danger ? '#E53935' : colors.textPrimary },
                      ]}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 14, fontWeight: '600' },
  previewArtist: { fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginBottom: 4 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
  },
  actionLabel: { fontSize: 14 },
});
