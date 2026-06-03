import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../auth/AuthContext';
import { useOffline } from '../offline/OfflineContext';
import { useTheme, useThemeMode } from '../ThemeContext';
import { apiResolveCustomer, apiWorklist } from '../api/services';
import { apiErrorMessage, isNetworkError } from '../api/client';
import { fonts, palette, pastels, Pastel, radius, shadow, tracking, Theme } from '../theme';
import WaveBackground from '../components/ui/WaveBackground';
import { GlassCard } from '../components/ui/Cards';
import LiquidProgress from '../components/ui/LiquidProgress';
import {
  AlertIcon,
  CashIcon,
  ChevronIcon,
  GridIcon,
  IconProps,
  ListCheckIcon,
  MapPinIcon,
  MoonIcon,
  PowerIcon,
  ScanIcon,
  SearchIcon,
  SunIcon,
  SyncIcon,
} from '../components/ui/Icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { mode, toggle } = useThemeMode();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const {
    isOnline,
    pendingCount,
    syncing,
    sync,
    resolveOffline,
    cacheCount,
    cacheSyncedAt,
    refreshingCache,
    refreshCustomerCache,
  } = useOffline();
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [wl, setWl] = useState<{ done: number; total: number; pending: number } | null>(null);

  useEffect(() => {
    let alive = true;
    apiWorklist()
      .then((w) => alive && setWl({ done: w.done, total: w.total, pending: w.pending }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function onSync() {
    const res = await sync();
    if (res) {
      Alert.alert(
        'Sinkronisasi',
        `${res.synced} terkirim` + (res.remaining > 0 ? `, ${res.remaining} masih menunggu` : ''),
      );
    }
  }

  async function openManual() {
    const code = manualCode.trim();
    if (!code) return;
    setLoading(true);
    try {
      const info = await apiResolveCustomer(code);
      setManualCode('');
      navigation.navigate('Reading', { meterInfo: info });
    } catch (e) {
      if (isNetworkError(e)) {
        const offline = await resolveOffline(code);
        if (offline) {
          setManualCode('');
          navigation.navigate('Reading', { meterInfo: offline });
        } else {
          Alert.alert('Offline', 'Pelanggan tidak ada di cache. Sinkronkan data saat ada koneksi.');
        }
      } else {
        Alert.alert('Tidak ditemukan', apiErrorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  }

  function formatSyncedAt(iso: string | null): string {
    if (!iso) return 'belum pernah';
    const d = new Date(iso);
    return `${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  }

  const progress = wl && wl.total > 0 ? wl.done / wl.total : 0;

  return (
    <ScrollView
      style={{ backgroundColor: 'transparent' }}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ---- Wave hero ---- */}
      <WaveBackground height={336} style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={[s.heroInner, { paddingTop: insets.top + 14 }]}>
          <View style={s.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.hello}>Halo,</Text>
              <Text style={s.name} numberOfLines={1}>{user?.fullname ?? user?.username}</Text>
              <Text style={s.role}>Petugas Lapangan · Meter Air</Text>
            </View>
            <View style={s.heroActions}>
              <TouchableOpacity onPress={toggle} style={s.iconBtn} activeOpacity={0.8}>
                {mode === 'dark' ? <SunIcon size={20} color={palette.white} /> : <MoonIcon size={19} color={palette.white} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={s.iconBtn} activeOpacity={0.8}>
                <PowerIcon size={20} color={palette.white} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Worklist')}>
            <GlassCard style={s.heroCard} intensity={30}>
              <View style={s.heroCardRow}>
                <LiquidProgress progress={progress} size={116} label="Tercatat" />
                <View style={s.heroCardText}>
                  <Text style={s.heroCardTitle}>Worklist Hari Ini</Text>
                  <Text style={s.heroCardSub}>
                    {wl ? `${wl.done} dari ${wl.total} pelanggan tercatat` : 'Memuat progres…'}
                  </Text>
                  <View style={s.heroChip}>
                    <ListCheckIcon size={15} color={palette.deep} />
                    <Text style={s.heroChipText}>{wl ? `${wl.pending} belum dicatat` : '—'}</Text>
                    <ChevronIcon size={15} color={palette.deep} />
                  </View>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </WaveBackground>

      <View style={s.body}>
        {(!isOnline || pendingCount > 0) && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={[s.statusBar, !isOnline ? s.statusOffline : s.statusPending]}>
              <SyncIcon size={18} color={!isOnline ? t.warning : t.primary} />
              <Text style={s.statusText}>
                {!isOnline ? 'Mode offline aktif' : `${pendingCount} catatan menunggu sinkron`}
              </Text>
              {pendingCount > 0 && (
                <TouchableOpacity
                  onPress={onSync}
                  disabled={syncing || !isOnline}
                  style={[s.syncBtn, (syncing || !isOnline) && { opacity: 0.5 }]}
                >
                  <Text style={s.syncBtnText}>{syncing ? 'Menyinkronkan…' : 'Sinkronkan'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <TouchableOpacity activeOpacity={0.92} onPress={() => navigation.navigate('Scan')}>
            <LinearGradient
              colors={t.scan}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.scanCard, shadow.glow]}
            >
              <View style={s.scanIconWrap}>
                <ScanIcon size={30} color={palette.white} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.scanTitle}>Scan QR Meter</Text>
                <Text style={s.scanSub}>Arahkan kamera ke QR pada meter pelanggan</Text>
              </View>
              <ChevronIcon size={22} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text style={s.sectionTitle}>Aksi Cepat</Text>
          <View style={s.grid}>
            <ActionTile s={s} t={t} Icon={ListCheckIcon} pastel={pastels.sky} title="Worklist" sub="Belum dicatat" onPress={() => navigation.navigate('Worklist')} />
            <ActionTile s={s} t={t} Icon={CashIcon} pastel={pastels.peach} title="Tunggakan" sub="Denda & nunggak" onPress={() => navigation.navigate('Tunggakan')} />
            <ActionTile s={s} t={t} Icon={AlertIcon} pastel={pastels.lavender} title="Anomali" sub="Bocor / rusak" onPress={() => navigation.navigate('Anomaly')} />
            <ActionTile s={s} t={t} Icon={GridIcon} pastel={pastels.mint} title="Master Data" sub="Produk & supplier" onPress={() => navigation.navigate('MasterData')} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={s.sectionTitle}>Input Manual</Text>
          <View style={s.manualCard}>
            <View style={s.manualInputWrap}>
              <SearchIcon size={18} color={t.muted} />
              <TextInput
                style={s.manualInput}
                placeholder="ID / barcode pelanggan"
                placeholderTextColor={t.muted}
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="none"
                onSubmitEditing={openManual}
              />
            </View>
            <TouchableOpacity style={[s.manualBtn, loading && { opacity: 0.6 }]} onPress={openManual} disabled={loading}>
              <Text style={s.manualBtnText}>{loading ? '…' : 'Cari'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()} style={s.cacheRow}>
          <MapPinIcon size={15} color={t.muted} />
          <Text style={s.cacheText}>{cacheCount} pelanggan di cache · {formatSyncedAt(cacheSyncedAt)}</Text>
          <TouchableOpacity
            onPress={refreshCustomerCache}
            disabled={refreshingCache || !isOnline}
            style={[s.cacheBtn, (refreshingCache || !isOnline) && { opacity: 0.5 }]}
          >
            <Text style={s.cacheBtnText}>{refreshingCache ? '…' : 'Perbarui'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function ActionTile({
  s,
  t,
  Icon,
  pastel,
  title,
  sub,
  onPress,
}: {
  s: ReturnType<typeof createStyles>;
  t: Theme;
  Icon: (p: IconProps) => React.JSX.Element;
  pastel: Pastel;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.tile} activeOpacity={0.85} onPress={onPress}>
      <View style={[s.tileIcon, { backgroundColor: t.isDark ? pastel.fg + '26' : pastel.bg }]}>
        <Icon size={23} color={pastel.fg} strokeWidth={2.2} />
      </View>
      <Text style={s.tileTitle}>{title}</Text>
      <Text style={s.tileSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    heroInner: { flex: 1, paddingHorizontal: 20, paddingBottom: 18, justifyContent: 'space-between' },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start' },
    heroActions: { flexDirection: 'row', gap: 10 },
    hello: { color: palette.foam, fontFamily: fonts.medium, fontSize: 12, letterSpacing: tracking.overline, textTransform: 'uppercase' },
    name: { color: palette.white, fontFamily: fonts.displayBlack, fontSize: 30, marginTop: 3, letterSpacing: tracking.display },
    role: { color: 'rgba(231,247,247,0.78)', fontFamily: fonts.medium, fontSize: 12, marginTop: 4 },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCard: { marginTop: 8 },
    heroCardRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    heroCardText: { flex: 1 },
    heroCardTitle: { color: palette.white, fontFamily: fonts.displayBold, fontSize: 18, letterSpacing: tracking.tight },
    heroCardSub: { color: palette.foam, fontFamily: fonts.regular, fontSize: 12, marginTop: 3 },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      marginTop: 10,
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.pill,
    },
    heroChipText: { color: palette.deep, fontFamily: fonts.semibold, fontSize: 11 },

    body: { paddingHorizontal: 20, marginTop: 18 },

    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: radius.md,
      marginBottom: 14,
      borderWidth: 1,
    },
    statusOffline: { backgroundColor: t.isDark ? '#3a2a12' : '#FFF3E0', borderColor: t.warning + '66' },
    statusPending: { backgroundColor: t.isDark ? '#0e333b' : '#E3F4F6', borderColor: t.primary + '55' },
    statusText: { flex: 1, color: t.text, fontFamily: fonts.semibold, fontSize: 13 },
    syncBtn: { backgroundColor: t.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    syncBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 12 },

    scanCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radius.lg, padding: 18 },
    scanIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanTitle: { color: palette.white, fontFamily: fonts.bold, fontSize: 19 },
    scanSub: { color: 'rgba(255,255,255,0.9)', fontFamily: fonts.regular, fontSize: 12.5, marginTop: 2 },

    sectionTitle: { color: t.text, fontFamily: fonts.display, fontSize: 19, marginTop: 24, marginBottom: 14, letterSpacing: tracking.tight },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
    tile: {
      width: '48%',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      padding: 16,
      ...shadow.soft,
    },
    tileIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    tileTitle: { color: t.text, fontFamily: fonts.bold, fontSize: 15 },
    tileSub: { color: t.muted, fontFamily: fonts.regular, fontSize: 11.5, marginTop: 2 },

    manualCard: {
      flexDirection: 'row',
      gap: 10,
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      padding: 12,
      ...shadow.soft,
    },
    manualInputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.surfaceAlt,
      borderRadius: radius.sm,
      paddingHorizontal: 12,
    },
    manualInput: { flex: 1, paddingVertical: 12, color: t.text, fontFamily: fonts.regular, fontSize: 14 },
    manualBtn: { backgroundColor: t.primary, borderRadius: radius.sm, paddingHorizontal: 22, justifyContent: 'center' },
    manualBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },

    cacheRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 20,
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.border,
    },
    cacheText: { flex: 1, color: t.muted, fontFamily: fonts.regular, fontSize: 11.5 },
    cacheBtn: { backgroundColor: t.accent, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
    cacheBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 11 },
  });
