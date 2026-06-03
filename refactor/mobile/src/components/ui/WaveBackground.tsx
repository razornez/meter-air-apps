import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

/**
 * Build a seamless, tileable wave path across `2 * width` so translating it by
 * `-width` loops perfectly. Filled from the wave crest down to the bottom.
 */
function buildWave(width: number, amplitude: number, height: number): string {
  const total = width * 2;
  const half = width / 4; // 4 half-waves per screen width → seamless every `width`
  const baseline = amplitude;
  let d = `M 0 ${baseline}`;
  let up = true;
  for (let x = 0; x < total; x += half) {
    const cx = x + half / 2;
    const cy = up ? baseline - amplitude : baseline + amplitude;
    d += ` Q ${cx} ${cy} ${x + half} ${baseline}`;
    up = !up;
  }
  d += ` L ${total} ${height} L 0 ${height} Z`;
  return d;
}

type Props = {
  height?: number;
  colors?: readonly string[];
  style?: ViewStyle;
  children?: React.ReactNode;
};

/** Ocean gradient with two animated wave layers drifting at different speeds. */
export default function WaveBackground({ height = 260, colors, style, children }: Props) {
  const theme = useTheme();
  const gradColors = colors ?? theme.hero;
  const w = SCREEN_W;
  const x1 = useSharedValue(0);
  const x2 = useSharedValue(-w);

  useEffect(() => {
    x1.value = withRepeat(withTiming(-w, { duration: 9000, easing: Easing.linear }), -1, false);
    x2.value = withRepeat(withTiming(0, { duration: 13000, easing: Easing.linear }), -1, false);
  }, [w, x1, x2]);

  const back = useAnimatedStyle(() => ({ transform: [{ translateX: x2.value }] }));
  const front = useAnimatedStyle(() => ({ transform: [{ translateX: x1.value }] }));

  const waveH = 90;
  const backPath = buildWave(w, 16, waveH);
  const frontPath = buildWave(w, 24, waveH);

  return (
    <View style={[{ height, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={gradColors as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* soft caustic light from top-right */}
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'transparent'] as [string, string]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Back wave (slower, translucent) */}
      <Animated.View style={[styles.waveLayer, { width: w * 2, height: waveH }, back]}>
        <Svg width={w * 2} height={waveH}>
          <Path d={backPath} fill="rgba(255,255,255,0.16)" />
        </Svg>
      </Animated.View>
      {/* Front wave (faster, brighter) */}
      <Animated.View style={[styles.waveLayer, { width: w * 2, height: waveH, bottom: -8 }, front]}>
        <Svg width={w * 2} height={waveH}>
          <Path d={frontPath} fill="rgba(255,255,255,0.26)" />
        </Svg>
      </Animated.View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  waveLayer: { position: 'absolute', left: 0, bottom: 0 },
  content: { flex: 1, zIndex: 2 },
});
