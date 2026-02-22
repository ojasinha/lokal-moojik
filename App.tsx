import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AudioProvider } from './src/services/AudioProvider';
import { usePlayerStore } from './src/store/playerStore';

// Ensure navigation type declarations are loaded
import './src/navigation/types';

function AppInner() {
  const hydrate = usePlayerStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return <RootNavigator />;
}

export default function App() {
  const colorScheme = useColorScheme();

  const navTheme = colorScheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: '#FF8C00',
          background: '#141414',
          card: '#1A1A1A',
          border: '#2A2A2A',
          text: '#FFFFFF',
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: '#FF8C00',
          background: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E0E0E0',
          text: '#141414',
        },
      };

  const bgColor = colorScheme === 'dark' ? '#141414' : '#FFFFFF';

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaProvider style={{ backgroundColor: bgColor }}>
        <NavigationContainer theme={navTheme} style={{ backgroundColor: bgColor }}>
          <AudioProvider>
            <AppInner />
          </AudioProvider>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
