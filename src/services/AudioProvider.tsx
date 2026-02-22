import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';
import { getDownloadedUri } from '../utils/storage';

/**
 * Mounts once at the App root.
 * – Creates a stable AudioPlayer via the expo-audio hook.
 * – Registers play / toggle / seek callbacks into the Zustand store so
 *   any component can trigger audio without prop-drilling.
 * – Syncs playback status back into the store every 500 ms.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const _setPosition = usePlayerStore((s) => s._setPosition);
  const _setDuration = usePlayerStore((s) => s._setDuration);
  const _setIsPlaying = usePlayerStore((s) => s._setIsPlaying);
  const _registerCallbacks = usePlayerStore((s) => s._registerCallbacks);
  const playNext = usePlayerStore((s) => s.playNext);

  const finishedRef = useRef(false);

  // ── Set audio mode for background playback ───────────────────────────────────
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => {});
  }, []);

  // ── Register callbacks into Zustand store ────────────────────────────────────
  useEffect(() => {
    const onPlay = async (track: Track) => {
      // Check for locally downloaded file first
      const localUri = await getDownloadedUri(track.id);
      const uri = localUri ?? track.audioUrl;
      player.replace({ uri });
      player.play();
    };

    const onToggle = () => {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    };

    const onSeek = (secs: number) => {
      player.seekTo(secs);
    };

    _registerCallbacks(onPlay, onToggle, onSeek);
  }, [player, _registerCallbacks]);

  // ── Sync status → store ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof status.currentTime === 'number') _setPosition(status.currentTime);
    if (typeof status.duration === 'number' && status.duration > 0)
      _setDuration(status.duration);
    const isPlaying = status.playing ?? false;
    _setIsPlaying(isPlaying);

    // Detect end of track
    if (
      !status.playing &&
      status.didJustFinish === true
    ) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        playNext();
      }
    } else if (isPlaying) {
      finishedRef.current = false;
    }
  }, [status]);

  return <>{children}</>;
}
