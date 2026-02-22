import { useAppColors } from '@/hooks/use-app-colors';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import QueueScreen from '../screens/QueueScreen';
import SearchScreen from '../screens/SearchScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const colors = useAppColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ contentStyle: { backgroundColor: colors.background } }}
      />

      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 320,
          gestureEnabled: true,
          gestureDirection: 'vertical',
          contentStyle: { backgroundColor: colors.background },
        }}
      />

      <Stack.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Playing Queue',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      />

      <Stack.Screen
        name="ArtistDetail"
        component={ArtistDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: (route.params as any).artistName ?? 'Artist',
          headerTransparent: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        })}
      />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      />

      <Stack.Screen
        name="AlbumDetail"
        component={AlbumDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: (route.params as any).albumName ?? 'Album',
          headerTransparent: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        })}
      />

      <Stack.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: (route.params as any).playlistName ?? 'Playlist',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        })}
      />
    </Stack.Navigator>
  );
}
