import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, palette, radius } from '../../theme';

function wavePath(width: number, amplitude: number, height: number): string {
  const total = width * 2;
  const half = width / 2;
  let d = `M 0 ${amplitude}`;
  let up = true;
  for (let x = 0; x < total; x += half) {
    const cx = x + half / 2;
    const cy = up ? 0 : amplitude * 2;
    d += ` Q ${cx} ${cy} ${x + half} ${amplitude}`;
    up = !up;
  }
  d += ` L ${total} ${height} L 0 ${height} Z`;
  return d;
}

type Props = {
  progress: number; // 0..1
  size?: number;
  label?: string;
  sublabel?: string;
};

/** A rounded "water tank" that fills with animated rippling water to `progress`. */
export default function LiquidProgress({ progress, size = 132, label, sublabel }: Props) {
  const clamped = Math.max(0, Math.min(1, progress || 0));
  const level = useSharedValue(0);
  const driftX = useSharedValue(0);
  const waveW = size;
  const waveH = 40;

  useEffect(() => {
    level.value = withTiming(clamped, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [clamped, level]);

  useEffect(() => {
    driftX.value = withRepeat(withTiming(-waveW, { duration: 3200, easing: Easing.linear }), -1, false);
  }, [driftX, waveW]);

  // Reveal water from the bottom by sliding a full-height fill down.
  const waterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - level.value) * size }],
  }));
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ translateX: driftX.value }] }));

  const pct = Math.round(clamped * 100);

  return (
    <View style={[styles.tank, { width: size, height: size, borderRadius: radius.lg }]}>
      <Animated.View style={[StyleSheet.absoluteFill, waterStyle]}>
        {/* wave crest riding on top of the water surface */}
        <Animated.View style={[styles.wave, { width: waveW * 2, height: waveH, top: -waveH + 2 }, waveStyle]}>
          <Svg width={waveW * 2} height={waveH}>
            <Path d={wavePath(waveW, 7, waveH)} fill={palette.aquaLight} opacity={0.9} />
          </Svg>
        </Animated.View>
        <LinearGradient
          colors={[palette.aqua, palette.teal] as [string, string]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* gloss + center readout */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.pct}>{pct}%</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {sublabel ? <Text style={styles.sub}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tank: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: { position: 'absolute', left: 0 },
  center: { alignItems: 'center', paddingHorizontal: 8 },
  pct: { color: palette.white, fontFamily: fonts.displayBlack, fontSize: 34, includeFontPadding: false, letterSpacing: -1 },
  label: { color: palette.white, fontFamily: fonts.semibold, fontSize: 12, marginTop: 2, opacity: 0.95 },
  sub: { color: palette.foam, fontFamily: fonts.regular, fontSize: 10, marginTop: 1, textAlign: 'center' },
});
