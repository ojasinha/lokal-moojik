import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { ChevronsRight, ListPlus, Play } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SectionHeader } from '../components/SectionHeader';
import { ShufflePlayButtons } from '../components/ShufflePlayButtons';
import { SongContextMenu, type ContextAction } from '../components/SongContextMenu';
import { SongItem } from '../components/SongItem';
import type { RootStackParamList } from '../navigation/types';
import { getAlbum, normaliseRawSong } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';
import { decodeHtmlEntities } from '../utils/html';
import { formatTotalDuration } from '../utils/time';

const PLACEHOLDER = require('@/assets/images/icon.png');

export default function AlbumDetailScreen() {
  const route = useRoute();
  const colors = useAppColors();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { albumId } = route.params as { albumId: string; albumName: string };

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playSong = usePlayerStore((s) => s.playSong);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const addNextInQueue = usePlayerStore((s) => s.addNextInQueue);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const [albumName, setAlbumName] = useState('');
  const [artist, setArtist] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [year, setYear] = useState('');
  const [songs, setSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAlbum(albumId);
        if (!cancelled && data) {
          setAlbumName(data.name ? decodeHtmlEntities(data.name) : '');
          setArtist(data.primaryArtists ? decodeHtmlEntities(data.primaryArtists) : data.artist ? decodeHtmlEntities(data.artist) : '');
          setYear(data.year ?? '');
          const imgs = data.image ?? [];
          const x500 = imgs.find((i) => i.quality === '500x500');
          const picked = x500 ?? imgs[imgs.length - 1];
          setArtworkUrl(picked?.url ?? picked?.link ?? '');
          const raw = data.songs ?? [];
          setSongs(raw.map(normaliseRawSong));
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [albumId]);

  const totalSecs = songs.reduce((s, t) => s + t.durationSecs, 0);

  const handlePlay = (from = 0) => {
    if (songs.length) {
      playSong(songs[from], songs, from);
      nav.navigate('Player');
    }
  };

  const handleShuffle = () => {
    if (!songs.length) return;
    toggleShuffle();
    const idx = Math.floor(Math.random() * songs.length);
    playSong(songs[idx], songs, idx);
    nav.navigate('Player');
  };

  const getMenuActions = (track: Track): ContextAction[] => [
    { icon: Play, label: 'Play', onPress: () => handlePlay(songs.indexOf(track)) },
    { icon: ChevronsRight, label: 'Play Next', onPress: () => addNextInQueue(track) },
    { icon: ListPlus, label: 'Add to Queue', onPress: () => addToQueue(track) },
  ];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.heroContainer}>
        <Image
          source={artworkUrl ? { uri: artworkUrl } : PLACEHOLDER}
          style={styles.hero}
          contentFit="cover"
        />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{albumName}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          {artist ? decodeHtmlEntities(artist) : 'Album'} | {songs.length} Songs | {formatTotalDuration(totalSecs)}
        </Text>
      </View>

      <ShufflePlayButtons onShuffle={handleShuffle} onPlay={() => handlePlay(0)} />

      <SectionHeader title="Songs" />

      {songs.map((track) => (
        <SongItem
          key={track.id}
          track={track}
          isPlaying={currentTrack?.id === track.id}
          onPress={() => handlePlay(songs.indexOf(track))}
          onMorePress={() => setMenuTrack(track)}
        />
      ))}

      <View style={{ height: 40 }} />

      <SongContextMenu
        visible={!!menuTrack}
        track={menuTrack}
        onClose={() => setMenuTrack(null)}
        actions={menuTrack ? getMenuActions(menuTrack) : []}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  hero: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  meta: { alignItems: 'center', paddingHorizontal: 16, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 13, marginTop: 6, textAlign: 'center' },
});
