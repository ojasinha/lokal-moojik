import { ACCENT } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Music4, Search } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';

import { AlbumsTab } from './AlbumsTab';
import { ArtistsTab } from './ArtistsTab';
import { SongsTab } from './SongsTab';
import { SuggestedTab } from './SuggestedTab';

type TabKey = 'Suggested' | 'Songs' | 'Artists' | 'Albums';
const TABS: TabKey[] = ['Suggested', 'Songs', 'Artists', 'Albums'];

export default function HomeScreen() {
  const colors = useAppColors();
  const { width } = useWindowDimensions();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabKey>('Suggested');
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const tabWidth = width / TABS.length;

  const handleTabPress = (tab: TabKey, index: number) => {
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: index * tabWidth,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Music4 size={24} color={ACCENT} />
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Moojik</Text>
        </View>
        <TouchableOpacity
          onPress={() => nav.navigate('Search')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Search size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>



      {/* Top tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => handleTabPress(tab, i)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab ? ACCENT : colors.textSecondary },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Animated underline */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: ACCENT, width: tabWidth, transform: [{ translateX: indicatorAnim }] },
          ]}
        />
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {activeTab === 'Suggested' && <SuggestedTab searchQuery="" />}
        {activeTab === 'Songs' && <SongsTab externalQuery="" />}
        {activeTab === 'Artists' && <ArtistsTab searchQuery="" />}
        {activeTab === 'Albums' && <AlbumsTab searchQuery="" />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appName: { fontSize: 18, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  tab: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
  content: { flex: 1 },
});
