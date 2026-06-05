import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, shadow, tracking } from '../../theme';
import { useTheme } from '../../ThemeContext';
import { ArrowLeftIcon } from './Icons';

const { width: W } = Dimensions.get('window');

function buildWavePath(width: number, amplitude: number, totalH: number): string {
  const total = width * 2;
  const half = width / 3;
  let d = `M 0 ${amplitude}`;
  let up = true;
  for (let x = 0; x < total; x += half) {
    const cx = x + half / 2;
    const cy = up ? 0 : amplitude * 2;
    d += ` Q ${cx} ${cy} ${x + half} ${amplitude}`;
    up = !up;
  }
  d += ` L ${total} ${totalH} L 0 ${totalH} Z`;
  return d;
}

function WaveLayer({ amplitude, duration, waveColor, reverse = false }: {
  amplitude: number; duration: number; waveColor: string; reverse?: boolean;
}) {
  const x = useSharedValue(reverse ? -W : 0);
  const WAVE_H = amplitude * 2 + 2;
  const path = buildWavePath(W, amplitude, WAVE_H);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(reverse ? 0 : -W, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, reverse, x, W]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Animated.View style={[{ position: 'absolute', bottom: 0, width: W * 2, height: WAVE_H }, style]}>
      <Svg width={W * 2} height={WAVE_H}>
        <Path d={path} fill={waveColor} />
      </Svg>
    </Animated.View>
  );
}

export default function AppHeader({ navigation, route, options }: any) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const title: string = options?.title ?? route?.name ?? '';
  const canBack: boolean = navigation?.canGoBack?.() ?? false;
  const right = options?.headerRight?.({ tintColor: '#fff' });

  const totalH = insets.top + 64;

  return (
    <View style={[styles.wrap, { height: totalH }, shadow.soft]}>
      {/* Gradient base */}
      <LinearGradient
        colors={t.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Wave layers */}
      <WaveLayer amplitude={8}  duration={7000} waveColor="rgba(255,255,255,0.12)" />
      <WaveLayer amplitude={5}  duration={5000} waveColor="rgba(255,255,255,0.18)" reverse />
      <WaveLayer amplitude={3}  duration={9000} waveColor="rgba(255,255,255,0.08)" />

      {/* Content row */}
      <View style={[styles.row, { marginTop: insets.top + 4 }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 10 },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  slot: { minWidth: 40, alignItems: 'flex-end', justifyContent: 'center' },
  title: {
    flex: 1, color: '#fff',
    fontFamily: fonts.displayBold, fontSize: 21,
    letterSpacing: tracking.tight,
  },
});
