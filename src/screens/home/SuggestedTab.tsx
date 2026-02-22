import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SectionHeader } from '../../components/SectionHeader';
import { searchArtists, searchSongs } from '../../services/api';
import { usePlayerStore } from '../../store/playerStore';
import type { SearchArtist, Track } from '../../types/music';
import { decodeHtmlEntities } from '../../utils/html';

interface Props {
  searchQuery?: string;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function SuggestedTab({ searchQuery }: Props) {
  const colors = useAppColors();
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed);
  const playSong = usePlayerStore((s) => s.playSong);

  const [featuredSongs, setFeaturedSongs] = useState<Track[]>([]);
  const [artists, setArtists] = useState<SearchArtist[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const [songsRes, artistsRes, mostRes] = await Promise.all([
          searchSongs('arijit singh', 1, 10),
          searchArtists('bollywood'),
          searchSongs('hindi hits', 1, 10),
        ]);
        if (!cancelled) {
          setFeaturedSongs(songsRes.tracks);
          setArtists(artistsRes.slice(0, 8));
          setMostPlayed(mostRes.tracks);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  const recentDisplay = recentlyPlayed.length > 0 ? recentlyPlayed : featuredSongs;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
    >
      {/* Recently Played */}
      <SectionHeader title="Recently Played" />
      <FlatList
        data={recentDisplay.slice(0, 6)}
        keyExtractor={(t) => t.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recentCard}
            onPress={() => { playSong(item, recentDisplay); nav.navigate('Player' as never); }}
          >
            <Image
              source={item.artwork ? { uri: item.artwork } : PLACEHOLDER}
              style={styles.recentArt}
              contentFit="cover"
            />
            <Text style={[styles.recentName, { color: colors.textPrimary }]} numberOfLines={1}>
              {decodeHtmlEntities(item.name)}
            </Text>
            <Text style={[styles.recentArtist, { color: colors.textSecondary }]} numberOfLines={1}>
              {decodeHtmlEntities(item.primaryArtists)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Artists */}
      <SectionHeader title="Artists" />
      <FlatList
        data={artists}
        keyExtractor={(a) => a.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const img = item.image?.find((i) => i.quality === '150x150');
          const src = img?.link ?? img?.url ?? '';
          return (
            <TouchableOpacity style={styles.artistCard}>
              <Image
                source={src ? { uri: src } : PLACEHOLDER}
                style={styles.artistAvatar}
                contentFit="cover"
              />
              <Text style={[styles.artistName, { color: colors.textPrimary }]} numberOfLines={1}>
                {decodeHtmlEntities(item.name)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Most Played */}
      <SectionHeader title="Most Played" />
      <FlatList
        data={mostPlayed.slice(0, 6)}
        keyExtractor={(t) => t.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recentCard}
            onPress={() => { playSong(item, mostPlayed); nav.navigate('Player' as never); }}
          >
            <Image
              source={item.artwork ? { uri: item.artwork } : PLACEHOLDER}
              style={styles.recentArt}
              contentFit="cover"
            />
            <Text style={[styles.recentName, { color: colors.textPrimary }]} numberOfLines={1}>
              {decodeHtmlEntities(item.name)}
            </Text>
            <Text style={[styles.recentArtist, { color: colors.textSecondary }]} numberOfLines={1}>
              {decodeHtmlEntities(item.primaryArtists)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  recentCard: { width: 140, marginHorizontal: 6 },
  recentArt: {
    width: 140,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#333',
  },
  recentName: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  recentArtist: { fontSize: 12, marginTop: 3 },
  artistCard: { alignItems: 'center', width: 105, marginHorizontal: 6 },
  artistAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#333',
  },
  artistName: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
