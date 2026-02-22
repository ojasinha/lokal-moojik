import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { ChevronDown, CircleCheckBig, Download, Heart, ListMusic } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayerControls } from '../components/PlayerControls';
import { SeekBar } from '../components/SeekBar';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../store/playerStore';
import { decodeHtmlEntities } from '../utils/html';
import { setDownloadedUri } from '../utils/storage';

const PLACEHOLDER = require('@/assets/images/icon.png');

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useAppColors();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const toggleFavourite = usePlayerStore((s) => s.toggleFavourite);
  const favourites = usePlayerStore((s) => s.favourites);
  const downloadedTracks = usePlayerStore((s) => s.downloadedTracks);
  const addDownloadedTrack = usePlayerStore((s) => s.addDownloadedTrack);

  const [downloading, setDownloading] = useState(false);

  // Compute whether current track is favorited
  const loved = currentTrack ? favourites.some((f) => f.id === currentTrack.id) : false;

  // Compute whether current track is downloaded
  const downloaded = currentTrack ? downloadedTracks.some((d) => d.id === currentTrack.id) : false;

  const handleDownload = async () => {
    if (!currentTrack?.audioUrl) return;
    setDownloading(true);
    try {
      const url = currentTrack.audioUrl320 ?? currentTrack.audioUrl;
      const filename = `${currentTrack.id}.mp4`;
      const dest = `${FileSystem.documentDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(url, dest);
      await setDownloadedUri(currentTrack.id, uri);
      addDownloadedTrack(currentTrack);
      Alert.alert('Downloaded', `"${decodeHtmlEntities(currentTrack.name)}" saved for offline listening.`);
    } catch {
      Alert.alert('Download failed', 'Could not download the song. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!currentTrack) {
    return (
      <View style={[styles.container(colors), styles.center]}>
        <Text style={{ color: colors.textSecondary }}>No song playing</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <ChevronDown size={32} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container(colors), { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle={colors.textPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ChevronDown size={32} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topMeta}>
          <Text style={[styles.topLabel, { color: colors.textSecondary }]}>Now Playing</Text>
          <Text style={[styles.topAlbum, { color: colors.textPrimary }]} numberOfLines={1}>{decodeHtmlEntities(currentTrack.album.name)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => nav.navigate('Queue')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ListMusic size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content wrapper - artwork + controls */}
      <View style={styles.contentWrapper}>
        {/* Artwork */}
        <View style={styles.artContainer}>
          <Image
            source={currentTrack.artwork ? { uri: currentTrack.artwork } : PLACEHOLDER}
            style={styles.art}
            contentFit="cover"
          />
        </View>

        {/* Song info + actions */}
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={[styles.songName, { color: colors.textPrimary }]} numberOfLines={1}>{decodeHtmlEntities(currentTrack.name)}</Text>
            <Text style={[styles.artists, { color: colors.textSecondary }]} numberOfLines={1}>{decodeHtmlEntities(currentTrack.primaryArtists)}</Text>
          </View>
          <View style={styles.infoActions}>
            <TouchableOpacity onPress={() => currentTrack && toggleFavourite(currentTrack)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Heart
                size={24}
                color={loved ? ACCENT : colors.textPrimary}
                fill={loved ? ACCENT : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDownload}
              disabled={downloading || downloaded}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {downloading ? (
                <ActivityIndicator size="small" color={ACCENT} />
              ) : downloaded ? (
                <CircleCheckBig size={24} color={ACCENT} />
              ) : (
                <Download size={24} color={colors.textPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Seek bar */}
        <View style={styles.seekContainer}>
          <SeekBar position={position} duration={duration} onSeek={seekTo} />
        </View>

        {/* Player controls */}
        <View style={styles.controlsContainer}>
          <PlayerControls />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: (colors: any) => ({
    flex: 1,
    backgroundColor: colors.background,
  }),
  center: { justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  topMeta: { alignItems: 'center', flex: 1 },
  topLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },
  topAlbum: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  artContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 16,
  },
  art: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  infoText: { flex: 1 },
  songName: { fontSize: 20, fontWeight: '700' },
  artists: { fontSize: 14, marginTop: 4 },
  infoActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginLeft: 12 },
  seekContainer: { paddingHorizontal: 0, marginBottom: 16 },
  controlsContainer: { paddingBottom: 16 },
});
