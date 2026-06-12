import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { formatRupiah } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type ResultStatus = 'verifying' | 'success' | 'pending' | 'error';

const R = 54;
const C = 2 * Math.PI * R;            // keliling lingkaran (utk stroke-draw)
const CHECK = 'M40 62 L54 76 L82 44'; // path ceklist
const CHECK_LEN = 70;

const CFG: Record<Exclude<ResultStatus, 'verifying'>, { color: string; title: string; sub: string; icon: 'time' | 'close' }> = {
  success: { color: '#16a34a', title: 'Pembayaran Berhasil', sub: 'Faktur sudah LUNAS', icon: 'time' },
  pending: { color: '#d97706', title: 'Menunggu Pembayaran', sub: 'Status diperbarui otomatis', icon: 'time' },
  error:   { color: '#dc2626', title: 'Pembayaran Gagal', sub: 'Silakan coba lagi', icon: 'close' },
};

/**
 * Overlay hasil pembayaran beranimasi: spinner berputar saat "mengecek", lalu lingkaran +
 * ceklist TERGAMBAR (stroke-draw) saat sukses, dengan ripple melebar. Pengganti pop-up polos.
 */
export function PaymentResultOverlay({ status, amount, onDone }: { status: ResultStatus; amount?: number; onDone?: () => void }) {
  const useND = Platform.OS !== 'web';
  const spin = useRef(new Animated.Value(0)).current;
  const circleOff = useRef(new Animated.Value(C)).current;        // strokeDashoffset lingkaran
  const checkOff = useRef(new Animated.Value(CHECK_LEN)).current; // strokeDashoffset ceklist
  const iconScale = useRef(new Animated.Value(0)).current;        // utk pending/error
  const ripple = useRef(new Animated.Value(0)).current;

  // Fase "mengecek": spinner berputar terus.
  useEffect(() => {
    if (status !== 'verifying') return;
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 850, easing: Easing.linear, useNativeDriver: useND }));
    loop.start();
    return () => loop.stop();
  }, [status, spin, useND]);

  // Fase hasil: gambar lingkaran → ceklist (atau pop ikon) + ripple + auto-dismiss.
  useEffect(() => {
    if (status === 'verifying') return;
    Animated.timing(circleOff, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      .start(() => {
        if (status === 'success') {
          Animated.timing(checkOff, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
        } else {
          Animated.spring(iconScale, { toValue: 1, friction: 4, tension: 130, useNativeDriver: useND }).start();
        }
      });
    Animated.loop(Animated.timing(ripple, { toValue: 1, duration: 1300, easing: Easing.out(Easing.ease), useNativeDriver: useND }), { iterations: 2 }).start();
    const t = setTimeout(() => onDone?.(), status === 'error' ? 1900 : 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === 'verifying') {
    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
      <View style={s.overlay}>
        <Animated.View style={[s.spinner, { transform: [{ rotate }] }]} />
        <Text style={s.title}>Mengecek status pembayaran…</Text>
      </View>
    );
  }

  const cfg = CFG[status];
  const rippleStyle = {
    opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
    transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
  };

  return (
    <Pressable style={s.overlay} onPress={onDone}>
      <View style={s.iconWrap}>
        <Animated.View style={[s.ripple, { backgroundColor: cfg.color }, rippleStyle]} />
        <Svg width={130} height={130} viewBox="0 0 120 120">
          <AnimatedCircle
            cx={60} cy={60} r={R} fill="none" stroke={cfg.color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={circleOff} transform="rotate(-90 60 60)"
          />
          {status === 'success' && (
            <AnimatedPath
              d={CHECK} fill="none" stroke={cfg.color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={CHECK_LEN} strokeDashoffset={checkOff}
            />
          )}
        </Svg>
        {status !== 'success' && (
          <Animated.View style={[s.centerIcon, { transform: [{ scale: iconScale }] }]}>
            <Ionicons name={cfg.icon} size={54} color={cfg.color} />
          </Animated.View>
        )}
      </View>

      <Text style={[s.title, { color: cfg.color }]}>{cfg.title}</Text>
      {status === 'success' && amount != null && <Text style={s.amount}>{formatRupiah(amount)}</Text>}
      <Text style={s.sub}>{cfg.sub}</Text>
      <Text style={s.tap}>Ketuk untuk menutup</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.97)', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 28 },
  spinner: { width: 64, height: 64, borderRadius: 32, borderWidth: 5, borderColor: '#E5E7EB', borderTopColor: '#16a34a', marginBottom: 18 },
  iconWrap: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  ripple: { position: 'absolute', width: 96, height: 96, borderRadius: 48 },
  centerIcon: { position: 'absolute' },
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 6 },
  amount: { fontSize: 26, fontWeight: '900', color: '#111827', marginTop: 4, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  tap: { fontSize: 12, color: '#9CA3AF', marginTop: 18 },
});
