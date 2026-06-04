import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, shadow, tracking } from '../../theme';
import { useTheme } from '../../ThemeContext';
import { ArrowLeftIcon } from './Icons';

/**
 * Premium soft header (gradient, rounded bottom) shared by tab + stack screens.
 * Compatible with both native-stack and bottom-tabs `header` option props.
 */
export default function AppHeader({ navigation, route, options }: any) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const title: string = options?.title ?? route?.name ?? '';
  const canBack: boolean = navigation?.canGoBack?.() ?? false;
  const right = options?.headerRight?.({ tintColor: '#fff' });

  return (
    <LinearGradient
      colors={t.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, { paddingTop: insets.top + 8 }, shadow.soft]}
    >
      <View style={styles.row}>
        {canBack ? (
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
            <ArrowLeftIcon size={20} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.slot} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.slot}>{right}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 16, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 10 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slot: { minWidth: 40, alignItems: 'flex-end', justifyContent: 'center' },
  title: { flex: 1, color: '#fff', fontFamily: fonts.displayBold, fontSize: 21, letterSpacing: tracking.tight },
});
