import { useAppColors } from '@/hooks/use-app-colors';
import { Image } from 'expo-image';
import { MoreVertical } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SearchAlbum } from '../types/music';
import { decodeHtmlEntities } from '../utils/html';

interface Props {
  album: SearchAlbum;
  onPress: () => void;
  onMorePress?: () => void;
}

function getImage(album: SearchAlbum): string {
  const imgs = album.image;
  if (!imgs?.length) return '';
  const x500 = imgs.find((i) => i.quality === '500x500');
  const x150 = imgs.find((i) => i.quality === '150x150');
  const picked = x500 ?? x150 ?? imgs[imgs.length - 1];
  return picked?.link ?? picked?.url ?? '';
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function AlbumCard({ album, onPress, onMorePress }: Props) {
  const colors = useAppColors();
  const img = getImage(album);
  const artist = album.primaryArtists ?? album.artist ?? '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={img ? { uri: img } : PLACEHOLDER}
          style={styles.art}
          contentFit="cover"
        />
        {onMorePress && (
          <TouchableOpacity style={styles.menuButton} onPress={onMorePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MoreVertical size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>
          {decodeHtmlEntities(album.name)}
        </Text>
        {artist ? (
          <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
            {decodeHtmlEntities(artist)}
            {album.year ? ` | ${album.year}` : ''}
          </Text>
        ) : null}
        {album.songCount != null && (
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {album.songCount} songs
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
  },
  imageContainer: {
    position: 'relative',
  },
  art: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  menuButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 6,
  },
  info: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  sub: {
    fontSize: 11,
    marginTop: 3,
  },
});
