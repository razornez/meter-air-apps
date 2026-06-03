import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, shadow } from '../../theme';
import { useTheme } from '../../ThemeContext';

type CardProps = ViewProps & { style?: ViewStyle | ViewStyle[]; padded?: boolean };

/** Solid premium surface — soft layered shadow, hairline border. */
export function Card({ style, padded = true, children, ...rest }: CardProps) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: t.border,
          ...shadow.soft,
        },
        padded && styles.padded,
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

type GlassProps = CardProps & { intensity?: number };

/** Frosted "liquid glass" surface — use over gradients/imagery for depth. */
export function GlassCard({ style, padded = true, intensity = 40, children, ...rest }: GlassProps) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.glass,
        { borderColor: t.isDark ? 'rgba(120,220,230,0.25)' : 'rgba(255,255,255,0.5)' },
        style as ViewStyle,
      ]}
      {...rest}
    >
      <BlurView intensity={intensity} tint={t.glassTint} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={t.glassOverlay} style={StyleSheet.absoluteFill} />
      <View style={padded ? styles.padded : undefined}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { padding: 16 },
  glass: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1 },
});
