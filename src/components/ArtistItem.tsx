import { useAppColors } from '@/hooks/use-app-colors';
import { Image } from 'expo-image';
import { MoreVertical } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SearchArtist } from '../types/music';
import { decodeHtmlEntities } from '../utils/html';

interface Props {
  artist: SearchArtist;
  onPress: () => void;
  onMorePress?: () => void;
}

function getImage(artist: SearchArtist): string {
  const imgs = artist.image;
  if (!imgs?.length) return '';
  const x150 = imgs.find((i) => i.quality === '150x150');
  const picked = x150 ?? imgs[imgs.length - 1];
  return picked?.link ?? picked?.url ?? '';
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function ArtistItem({ artist, onPress, onMorePress }: Props) {
  const colors = useAppColors();
  const img = getImage(artist);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: false }}
    >
      <Image
        source={img ? { uri: img } : PLACEHOLDER}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {decodeHtmlEntities(artist.name)}
        </Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          {artist.albumCount || 0} Album{Number(artist.albumCount || 0) !== 1 ? 's' : ''} | {artist.songCount || 0} Songs
        </Text>
      </View>
      {onMorePress && (
        <TouchableOpacity
          onPress={onMorePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 0 }}
        >
          <MoreVertical size={20} color={colors.icon} />
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#333',
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '500' },
  sub: { fontSize: 12, marginTop: 2 },
});
