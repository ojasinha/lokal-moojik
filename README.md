# lokalmoojik

A React Native music streaming app built with Expo. Streams from JioSaavn, supports offline downloads, and runs on Android and iOS (not tested on iOS).

## Requirements
- Expo Go app

## Setup

```bash
git clone https://github.com/ojasinha/lokal-moojik.git
cd lokal-moojik
npm i
npx expo start
```
Scan QR code with Expo Go (Android) or with camera (iOS)

## Architecture

The app is split into four clear layers.

**Data** — `src/services/api.ts` talks to a JioSaavn proxy (`saavn.sumit.co`). All responses are normalized into a shared `Track` type so the rest of the app never touches raw API shapes.

**State** — Zustand (`src/store/playerStore.ts`) owns everything: current track, queue, shuffle/repeat mode, favourites, recently played, and downloaded tracks. Persistence happens via AsyncStorage on every write, loaded back at startup.

**Audio** — `src/services/AudioProvider.tsx` mounts once at the app root. It creates the `expo-audio` player instance and injects three callbacks (`onPlay`, `onTogglePlay`, `onSeek`) into the Zustand store. Any component can trigger playback by calling store actions — no prop drilling, no context threading.

**Navigation** — React Navigation with a native stack wrapping a bottom tab navigator. The full-screen player, queue, search, album detail, and artist detail screens sit on the stack above the tabs.

## Tradeoffs

**expo-audio over react-native-track-player**: `expo-audio` is the official Expo module and requires less native configuration. The cost is that background playback on iOS requires a proper development build and the `playsInSilentMode` audio session flag. It works, but iOS has its quirks.

**Manual React Navigation instead of Expo Router**: In my personal experience, Expo Router's file-based routing is much more clean.
