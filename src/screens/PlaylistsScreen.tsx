import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Download, Heart, ListPlus, Music2, Pencil, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../store/playerStore';
import type { Playlist, Track } from '../types/music';

const PLACEHOLDER = require('@/assets/images/icon.png');

interface BuiltInCard {
  id: string;
  name: string;
  Icon: any;
  iconColor: string;
  bgColor: string;
  getCount: () => number;
}

export default function PlaylistsScreen() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const downloadedTracks = usePlayerStore((s) => s.downloadedTracks);
  const favourites = usePlayerStore((s) => s.favourites);
  const playlists = usePlayerStore((s) => s.playlists);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist);
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameTarget, setRenameTarget] = useState<Playlist | null>(null);
  const [renameText, setRenameText] = useState('');

  const builtIns: BuiltInCard[] = [
    {
      id: 'downloaded',
      name: 'Downloaded Songs',
      Icon: Download,
      iconColor: '#4CAF50',
      bgColor: '#4CAF5022',
      getCount: () => downloadedTracks.length,
    },
    {
      id: 'favourites',
      name: 'Favourites',
      Icon: Heart,
      iconColor: '#E91E63',
      bgColor: '#E91E6322',
      getCount: () => favourites.length,
    },
  ];

  const handleCreatePlaylist = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createPlaylist(trimmed);
    setNewName('');
    setShowCreate(false);
  };

  const handleLongPress = (playlist: Playlist) => {
    Alert.alert(playlist.name, undefined, [
      {
        text: 'Rename',
        onPress: () => {
          setRenameTarget(playlist);
          setRenameText(playlist.name);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete Playlist', `Delete "${playlist.name}"? This cannot be undone.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(playlist.id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRename = () => {
    const trimmed = renameText.trim();
    if (renameTarget && trimmed) {
      renamePlaylist(renameTarget.id, trimmed);
    }
    setRenameTarget(null);
    setRenameText('');
  };

  const renderArtworkGrid = (tracks: Track[]) => {
    const artworks = tracks
      .filter((t) => t.artwork)
      .slice(0, 4)
      .map((t) => t.artwork);

    if (artworks.length === 0) return null;

    if (artworks.length < 4) {
      return (
        <Image
          source={{ uri: artworks[0] }}
          style={styles.gridSingle}
          contentFit="cover"
        />
      );
    }

    return (
      <View style={styles.grid2x2}>
        {artworks.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.gridCell} contentFit="cover" />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Playlists</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: ACCENT }]}
          onPress={() => setShowCreate(true)}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Built-in playlists */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LIBRARY</Text>
        {builtIns.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => nav.navigate('PlaylistDetail', { playlistId: item.id, playlistName: item.name })}
            activeOpacity={0.7}
          >
            <View style={[styles.builtInArt, { backgroundColor: item.bgColor }]}>
              <item.Icon size={28} color={item.iconColor} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.playlistName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                {item.getCount()} {item.getCount() === 1 ? 'song' : 'songs'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* User playlists */}
        <View style={styles.myPlaylistsHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 0, marginBottom: 0 }]}>
            MY PLAYLISTS
          </Text>
          <TouchableOpacity onPress={() => setShowCreate(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Plus size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>

        {playlists.length === 0 ? (
          <View style={styles.emptyPlaylists}>
            <ListPlus size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No playlists yet
            </Text>
            <TouchableOpacity
              style={[styles.createHintBtn, { borderColor: ACCENT }]}
              onPress={() => setShowCreate(true)}
            >
              <Text style={[styles.createHintText, { color: ACCENT }]}>Create your first playlist</Text>
            </TouchableOpacity>
          </View>
        ) : (
          playlists.map((playlist) => {
            const artworkGrid = renderArtworkGrid(playlist.tracks);
            return (
              <TouchableOpacity
                key={playlist.id}
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={() => nav.navigate('PlaylistDetail', { playlistId: playlist.id, playlistName: playlist.name })}
                onLongPress={() => handleLongPress(playlist)}
                activeOpacity={0.7}
              >
                <View style={[styles.artContainer, { backgroundColor: colors.surfaceAlt }]}>
                  {artworkGrid ?? <Music2 size={26} color={colors.icon} />}
                </View>
                <View style={styles.info}>
                  <Text style={[styles.playlistName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                    {playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'}
                  </Text>
                </View>
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    onPress={() => { setRenameTarget(playlist); setRenameText(playlist.name); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.iconBtn}
                  >
                    <Pencil size={16} color={colors.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Delete Playlist', `Delete "${playlist.name}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(playlist.id) },
                      ])
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.iconBtn}
                  >
                    <Trash2 size={16} color={colors.icon} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Create playlist modal */}
      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowCreate(false); setNewName(''); }}
      >
        <TouchableWithoutFeedback onPress={() => { setShowCreate(false); setNewName(''); }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Playlist</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Playlist name…"
                  placeholderTextColor={colors.textSecondary}
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreatePlaylist}
                />
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { borderColor: colors.border }]}
                    onPress={() => { setShowCreate(false); setNewName(''); }}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: ACCENT, borderColor: ACCENT }]}
                    onPress={handleCreatePlaylist}
                  >
                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Rename playlist modal */}
      <Modal
        visible={!!renameTarget}
        transparent
        animationType="fade"
        onRequestClose={() => { setRenameTarget(null); setRenameText(''); }}
      >
        <TouchableWithoutFeedback onPress={() => { setRenameTarget(null); setRenameText(''); }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Rename Playlist</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Playlist name…"
                  placeholderTextColor={colors.textSecondary}
                  value={renameText}
                  onChangeText={setRenameText}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleRename}
                />
                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { borderColor: colors.border }]}
                    onPress={() => { setRenameTarget(null); setRenameText(''); }}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: ACCENT, borderColor: ACCENT }]}
                    onPress={handleRename}
                  >
                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const ART_SIZE = 56;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  myPlaylistsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  builtInArt: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artContainer: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridSingle: {
    width: ART_SIZE,
    height: ART_SIZE,
  },
  grid2x2: {
    width: ART_SIZE,
    height: ART_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: ART_SIZE / 2,
    height: ART_SIZE / 2,
  },
  info: { flex: 1 },
  playlistName: { fontSize: 15, fontWeight: '600' },
  playlistCount: { fontSize: 13, marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  emptyPlaylists: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: { fontSize: 15 },
  createHintBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 4,
  },
  createHintText: { fontSize: 14, fontWeight: '600' },
  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  modalBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalBtnText: { fontSize: 14, fontWeight: '600' },
});
