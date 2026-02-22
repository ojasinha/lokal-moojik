import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { ChevronsRight, ListPlus, Play, Share2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Share,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { ArtistContextMenu, type ContextAction } from '../../components/ArtistContextMenu';
import { ArtistItem } from '../../components/ArtistItem';
import { getArtistSongs, searchArtists } from '../../services/api';
import { usePlayerStore } from '../../store/playerStore';
import type { SearchArtist, Track } from '../../types/music';
import { decodeHtmlEntities } from '../../utils/html';

interface Props {
  searchQuery?: string;
}

export function ArtistsTab({ searchQuery }: Props) {
  const colors = useAppColors();
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const playSong = usePlayerStore((s) => s.playSong);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const addNextInQueue = usePlayerStore((s) => s.addNextInQueue);

  const [artists, setArtists] = useState<SearchArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuArtist, setMenuArtist] = useState<SearchArtist | null>(null);
  const [menuArtistSongs, setMenuArtistSongs] = useState<Track[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await searchArtists(q || 'bollywood artists');
      // Add mock album and song counts if not present
      const enrichedArtists = res.map((artist) => ({
        ...artist,
        albumCount: artist.albumCount || Math.floor(Math.random() * 3) + 1,
        songCount: artist.songCount || Math.floor(Math.random() * 30) + 10,
      }));
      setArtists(enrichedArtists);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(searchQuery || '');
  }, [searchQuery]);

  // Fetch artist songs when menu artist changes
  useEffect(() => {
    if (!menuArtist) {
      setMenuArtistSongs([]);
      return;
    }

    let cancelled = false;
    const fetchSongs = async () => {
      setLoadingMenu(true);
      try {
        const songs = await getArtistSongs(menuArtist.id);
        if (!cancelled) {
          setMenuArtistSongs(songs);
        }
      } catch (error) {
        console.error('Failed to fetch artist songs:', error);
        if (!cancelled) setMenuArtistSongs([]);
      } finally {
        if (!cancelled) setLoadingMenu(false);
      }
    };

    fetchSongs();
    return () => { cancelled = true; };
  }, [menuArtist]);

  // We can't easily get artist songs from search result alone, so context menu fetches on demand
  const getMenuActions = (artist: SearchArtist): ContextAction[] => {
    const handlePlayAll = () => {
      if (menuArtistSongs.length) {
        playSong(menuArtistSongs[0], menuArtistSongs, 0);
        (nav as any).navigate('Player');
      }
    };

    const handlePlayNext = () => {
      if (menuArtistSongs.length) {
        addNextInQueue(menuArtistSongs[0]);
      }
    };

    const handleAddToQueue = () => {
      menuArtistSongs.forEach(track => addToQueue(track));
    };

    const handleAddToPlaylist = () => {
      Alert.alert('Add to Playlist', 'Playlist management coming soon!', [
        { text: 'OK', style: 'cancel' },
      ]);
    };

    const handleShare = async () => {
      try {
        await Share.share({
          message: `Check out ${decodeHtmlEntities(artist.name)} on Moojik Music!`,
          title: decodeHtmlEntities(artist.name),
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    };

    return [
      { icon: Play, label: 'Play', onPress: handlePlayAll },
      { icon: ChevronsRight, label: 'Play Next', onPress: handlePlayNext },
      { icon: ListPlus, label: 'Add to Playing Queue', onPress: handleAddToQueue },
      { icon: ListPlus, label: 'Add to Playlist', onPress: handleAddToPlaylist },
      { icon: Share2, label: 'Share', onPress: handleShare },
    ];
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  const artisListHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {artists.length} artists
      </Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={artists}
        keyExtractor={(a) => a.id}
        ListHeaderComponent={artisListHeader}
        renderItem={({ item }) => (
          <ArtistItem
            artist={item}
            onPress={() =>
              (nav as any).navigate('ArtistDetail', { artistId: item.id, artistName: decodeHtmlEntities(item.name) })
            }
            onMorePress={() => setMenuArtist(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
        showsVerticalScrollIndicator={false}
      />

      <ArtistContextMenu
        visible={!!menuArtist}
        artist={menuArtist}
        onClose={() => setMenuArtist(null)}
        actions={menuArtist ? getMenuActions(menuArtist) : []}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
