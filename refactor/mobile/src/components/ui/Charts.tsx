import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { fonts } from '../../theme';

const ACircle = Animated.createAnimatedComponent(Circle);

/** Animated ring/donut for ratios (e.g. paid vs total). */
export function DonutChart({
  value,
  size = 130,
  stroke = 14,
  color,
  track,
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color: string;
  track: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, value || 0));

  useEffect(() => {
    p.value = withTiming(clamped, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [clamped, p]);

  const animProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
          <ACircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            animatedProps={animProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

function Bar({ ratio, color, p }: { ratio: number; color: string; p: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ height: `${Math.max(4, ratio * 100) * p.value}%` }));
  return (
    <View style={styles.barSlot}>
      <Animated.View style={[styles.bar, { backgroundColor: color }, st]} />
    </View>
  );
}

/** Animated vertical bar chart (sparkline-ish). */
export function MiniBars({
  data,
  labels,
  color,
  height = 90,
  highlightLast,
  highlightColor,
}: {
  data: number[];
  labels?: string[];
  color: string;
  height?: number;
  highlightLast?: boolean;
  highlightColor?: string;
}) {
  const max = Math.max(1, ...data);
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [data, p]);

  return (
    <View>
      <View style={[styles.barsRow, { height }]}>
        {data.map((v, i) => (
          <Bar
            key={i}
            ratio={max > 0 ? v / max : 0}
            color={highlightLast && i === data.length - 1 ? highlightColor ?? color : color}
            p={p}
          />
        ))}
      </View>
      {labels && (
        <View style={styles.labelsRow}>
          {labels.map((l, i) => (
            <Text key={i} style={styles.barLabel} numberOfLines={1}>{l}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 8, minHeight: 4 },
  labelsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  barLabel: { flex: 1, textAlign: 'center', fontSize: 9.5, color: '#93A4B3', fontFamily: fonts.medium },
});
