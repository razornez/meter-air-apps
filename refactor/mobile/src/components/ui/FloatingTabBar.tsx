import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ChartIcon, DropletIcon, IconProps, InvoiceIcon, MapPinIcon, UsersIcon } from './Icons';
import { fonts, palette, radius, shadow } from '../../theme';
import { useTheme } from '../../ThemeContext';

export const TAB_BAR_SPACE = 104; // bottom padding screens should reserve

const ICONS: Record<string, (p: IconProps) => React.JSX.Element> = {
  Home: DropletIcon,
  CustomersList: UsersIcon,
  FakturList: InvoiceIcon,
  Reports: ChartIcon,
  Map: MapPinIcon,
};

const PILL_H = 46;
const BAR_H = 68;

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [barW, setBarW] = useState(0);
  const count = state.routes.length;
  const centerIndex = Math.floor(count / 2);
  const tabW = barW > 0 ? barW / count : 0;
  const tx = useSharedValue(0);

  useEffect(() => {
    tx.value = withSpring(state.index * tabW, { damping: 16, stiffness: 140, mass: 0.7 });
  }, [state.index, tabW, tx]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  const showIndicator = tabW > 0 && state.index !== centerIndex;

  const go = (routeKey: string, name: string, focused: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(name);
  };

  const centerRoute = state.routes[centerIndex];
  const CenterIcon = ICONS[centerRoute.name] ?? DropletIcon;
  const centerFocused = state.index === centerIndex;

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <View
        style={[styles.bar, shadow.float, { borderColor: t.isDark ? 'rgba(120,224,236,0.22)' : 'rgba(255,255,255,0.7)' }]}
        onLayout={(e) => setBarW(e.nativeEvent.layout.width)}
      >
        <BlurView intensity={50} tint={t.glassTint} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={t.barOverlay} style={StyleSheet.absoluteFill} />

        {showIndicator && (
          <Animated.View style={[styles.indicatorSlot, { width: tabW }, indicatorStyle]}>
            <LinearGradient
              colors={(t.isDark ? ['rgba(91,208,222,0.22)', 'rgba(43,175,194,0.18)'] : ['#E4F4F8', '#D4EEF3']) as readonly [string, string]}
              style={[styles.indicatorPill, { width: tabW - 20 }]}
            />
          </Animated.View>
        )}

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            if (index === centerIndex) {
              return <View key={route.key} style={styles.tab} />; // reserved space for FAB
            }
            const { options } = descriptors[route.key];
            const label = (options.tabBarLabel as string) ?? options.title ?? route.name;
            const Icon = ICONS[route.name] ?? DropletIcon;
            const focused = state.index === index;
            return (
              <Pressable key={route.key} onPress={() => go(route.key, route.name, focused)} style={styles.tab}>
                <TabItem focused={focused} Icon={Icon} label={label} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Elevated center button (ref 2) */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <Pressable onPress={() => go(centerRoute.key, centerRoute.name, centerFocused)}>
          <CenterFab Icon={CenterIcon} colors={t.scan} active={centerFocused} />
        </Pressable>
        <Text style={[styles.fabLabel, { color: centerFocused ? t.primary : t.muted }]}>
          {(descriptors[centerRoute.key].options.tabBarLabel as string) ?? centerRoute.name}
        </Text>
      </View>
    </View>
  );
}

function CenterFab({ Icon, colors, active }: { Icon: (p: IconProps) => React.JSX.Element; colors: readonly string[]; active: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSpring(active ? 1.06 : 1, { damping: 12, stiffness: 160 });
  }, [active, scale]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.fab, shadow.glow, a]}>
      <LinearGradient
        colors={colors as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabInner}
      >
        <Icon size={26} color={palette.white} strokeWidth={2.2} />
      </LinearGradient>
    </Animated.View>
  );
}

function TabItem({ focused, Icon, label }: { focused: boolean; Icon: (p: IconProps) => React.JSX.Element; label: string }) {
  const t = useTheme();
  const scale = useSharedValue(focused ? 1 : 0.92);
  useEffect(() => {
    scale.value = withSpring(focused ? 1.06 : 0.92, { damping: 12, stiffness: 160 });
  }, [focused, scale]);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const tint = focused ? t.primary : t.muted;
  return (
    <Animated.View style={[styles.item, aStyle]}>
      <Icon size={23} color={tint} strokeWidth={focused ? 2.2 : 1.9} />
      <Text style={[styles.label, { color: tint }]} numberOfLines={1}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 18, right: 18, alignItems: 'center' },
  bar: {
    width: '100%',
    height: BAR_H,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  item: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontFamily: fonts.semibold, fontSize: 10.5, includeFontPadding: false },
  indicatorSlot: { position: 'absolute', height: PILL_H, top: (BAR_H - PILL_H) / 2, alignItems: 'center', justifyContent: 'center' },
  indicatorPill: { height: PILL_H, borderRadius: 16 },
  fabWrap: { position: 'absolute', top: -26, left: 0, right: 0, alignItems: 'center' },
  fab: { borderRadius: 32, padding: 4, backgroundColor: 'transparent' },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  fabLabel: { fontFamily: fonts.semibold, fontSize: 10.5, marginTop: 2 },
});
