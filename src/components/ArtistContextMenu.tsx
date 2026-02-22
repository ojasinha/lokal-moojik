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
import type { SearchArtist } from '../types/music';

export interface ContextAction {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface Props {
  visible: boolean;
  artist: SearchArtist | null;
  actions: ContextAction[];
  onClose: () => void;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function ArtistContextMenu({ visible, artist, actions, onClose }: Props) {
  const colors = useAppColors();

  if (!artist) return null;

  const getImage = (): string => {
    const imgs = artist.image;
    if (!imgs?.length) return '';
    const x150 = imgs.find((i) => i.quality === '150x150');
    const picked = x150 ?? imgs[imgs.length - 1];
    return picked?.link ?? picked?.url ?? '';
  };

  const img = getImage();

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
              {/* Artist preview */}
              <View style={styles.preview}>
                <Image
                  source={img ? { uri: img } : PLACEHOLDER}
                  style={styles.art}
                  contentFit="cover"
                />
                <View style={styles.previewInfo}>
                  <Text style={[styles.previewName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {artist.name}
                  </Text>
                  <Text style={[styles.previewArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                    {artist.albumCount || 0} Album{Number(artist.albumCount || 0) !== 1 ? 's' : ''} | {artist.songCount || 0} Songs
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  preview: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  art: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewArtist: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
