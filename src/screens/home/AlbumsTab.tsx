import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AlbumCard } from '../../components/AlbumCard';
import { searchAlbums } from '../../services/api';
import type { SearchAlbum } from '../../types/music';
import { decodeHtmlEntities } from '../../utils/html';

interface Props {
  searchQuery?: string;
}

export function AlbumsTab({ searchQuery }: Props) {
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const [albums, setAlbums] = useState<SearchAlbum[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await searchAlbums(q || 'bollywood');
      setAlbums(res);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(searchQuery || '');
  }, [searchQuery]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  const albumsHeader = () => {
    const colors = useAppColors();
    return (
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {albums.length} albums
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={albums}
      keyExtractor={(a) => a.id}
      numColumns={2}
      ListHeaderComponent={albumsHeader}
      renderItem={({ item }) => (
        <AlbumCard
          album={item}
          onPress={() =>
            (nav as any).navigate('AlbumDetail', { albumId: item.id, albumName: decodeHtmlEntities(item.name) })
          }
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: tabBarHeight + 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
