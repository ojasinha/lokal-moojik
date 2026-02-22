import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { ListPlus, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';

interface Props {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
}

export function AddToPlaylistModal({ visible, track, onClose }: Props) {
  const colors = useAppColors();
  const playlists = usePlayerStore((s) => s.playlists);
  const addTrackToPlaylist = usePlayerStore((s) => s.addTrackToPlaylist);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAddTo = (playlistId: string) => {
    if (!track) return;
    addTrackToPlaylist(playlistId, track);
    onClose();
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = createPlaylist(trimmed);
    if (track) addTrackToPlaylist(id, track);
    setNewName('');
    setCreating(false);
    onClose();
  };

  const handleClose = () => {
    setCreating(false);
    setNewName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
              {/* Header */}
              <View style={styles.header}>
                <ListPlus size={20} color={ACCENT} />
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Add to Playlist
                </Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* New playlist row */}
              {creating ? (
                <View style={styles.createRow}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                    placeholder="Playlist name…"
                    placeholderTextColor={colors.textSecondary}
                    value={newName}
                    onChangeText={setNewName}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleCreate}
                  />
                  <TouchableOpacity style={[styles.createBtn, { backgroundColor: ACCENT }]} onPress={handleCreate}>
                    <Text style={styles.createBtnText}>Create</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setCreating(false); setNewName(''); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.newRow} onPress={() => setCreating(true)}>
                  <View style={[styles.newIcon, { backgroundColor: ACCENT + '22' }]}>
                    <Plus size={18} color={ACCENT} />
                  </View>
                  <Text style={[styles.newLabel, { color: ACCENT }]}>New Playlist</Text>
                </TouchableOpacity>
              )}

              {/* Existing playlists */}
              {playlists.length === 0 && !creating ? (
                <Text style={[styles.empty, { color: colors.textSecondary }]}>
                  No playlists yet. Create one above.
                </Text>
              ) : (
                <FlatList
                  data={playlists}
                  keyExtractor={(p) => p.id}
                  style={styles.list}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.playlistRow}
                      onPress={() => handleAddTo(item.id)}
                    >
                      <View style={[styles.playlistIcon, { backgroundColor: colors.surfaceAlt }]}>
                        <ListPlus size={18} color={colors.icon} />
                      </View>
                      <View style={styles.playlistInfo}>
                        <Text style={[styles.playlistName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                          {item.tracks.length} {item.tracks.length === 1 ? 'song' : 'songs'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 0 },
  newRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  newIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newLabel: { fontSize: 15, fontWeight: '600' },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  createBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { flexShrink: 1 },
  empty: {
    textAlign: 'center',
    padding: 24,
    fontSize: 14,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 15, fontWeight: '600' },
  playlistCount: { fontSize: 13, marginTop: 2 },
});
