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
import { useTranslation } from 'react-i18next';
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
  const { t: i18n } = useTranslation();
  const { mode, toggle } = useThemeMode();
  const insets = useSafeAreaInsets();
  const { user, tenant, logout } = useAuth();
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
  function renderGraceBanner() {
    if (!tenant?.dalam_grace_period) return null;
    return (
      <View style={s.graceBanner}>
        <Text style={s.graceBannerText}>
          {i18n('home_grace_banner', { days: Math.abs(tenant.sisa_hari ?? 0) })}
        </Text>
      </View>
    );
  }

  const graceDays = tenant?.dalam_grace_period ? Math.abs(tenant.sisa_hari ?? 0) : null;
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
        i18n('home_alert_sync_title'),
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
          Alert.alert(i18n('home_alert_offline_title'), i18n('home_alert_offline_message'));
        }
      } else {
        Alert.alert(i18n('home_alert_not_found_title'), apiErrorMessage(e));
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
    <ScrollView keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: 'transparent' }}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ---- Wave hero ---- */}
      <WaveBackground height={336} style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={[s.heroInner, { paddingTop: insets.top + 14 }]}>
          <View style={s.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.hello}>{i18n('home_greeting')}</Text>
              <Text style={s.name} numberOfLines={1}>{user?.fullname ?? user?.username}</Text>
              <Text style={s.role}>{i18n('home_role')}</Text>
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
                <LiquidProgress progress={progress} size={116} label={i18n('home_worklist_label_recorded')} />
                <View style={s.heroCardText}>
                  <Text style={s.heroCardTitle}>{i18n('home_worklist_title')}</Text>
                  <Text style={s.heroCardSub}>
                    {wl ? i18n('home_worklist_progress', { done: wl.done, total: wl.total }) : i18n('home_worklist_loading')}
                  </Text>
                  <View style={s.heroChip}>
                    <ListCheckIcon size={15} color={palette.deep} />
                    <Text style={s.heroChipText}>{wl ? i18n('home_worklist_pending', { pending: wl.pending }) : '—'}</Text>
                    <ChevronIcon size={15} color={palette.deep} />
                  </View>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </WaveBackground>

      {renderGraceBanner()}

      <View style={s.body}>
        {(!isOnline || pendingCount > 0) && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={[s.statusBar, !isOnline ? s.statusOffline : s.statusPending]}>
              <SyncIcon size={18} color={!isOnline ? t.warning : t.primary} />
              <Text style={s.statusText}>
                {!isOnline ? i18n('home_status_offline') : i18n('home_status_pending_sync', { count: pendingCount })}
              </Text>
              {pendingCount > 0 && (
                <TouchableOpacity
                  onPress={onSync}
                  disabled={syncing || !isOnline}
                  style={[s.syncBtn, (syncing || !isOnline) && { opacity: 0.5 }]}
                >
                  <Text style={s.syncBtnText}>{syncing ? i18n('home_button_syncing') : i18n('home_button_sync')}</Text>
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
                <Text style={s.scanTitle}>{i18n('home_scan_card_title')}</Text>
                <Text style={s.scanSub}>{i18n('home_scan_card_sub')}</Text>
              </View>
              <ChevronIcon size={22} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text style={s.sectionTitle}>{i18n('home_section_quick_actions')}</Text>
          <View style={s.grid}>
            <ActionTile s={s} t={t} Icon={ListCheckIcon} pastel={pastels.sky} title={i18n('home_tile_worklist_title')} sub={i18n('home_tile_worklist_sub')} onPress={() => navigation.navigate('Worklist')} />
            <ActionTile s={s} t={t} Icon={CashIcon} pastel={pastels.peach} title={i18n('home_tile_tunggakan_title')} sub={i18n('home_tile_tunggakan_sub')} onPress={() => navigation.navigate('Tunggakan')} />
            <ActionTile s={s} t={t} Icon={AlertIcon} pastel={pastels.lavender} title={i18n('home_tile_anomaly_title')} sub={i18n('home_tile_anomaly_sub')} onPress={() => navigation.navigate('Anomaly')} />
            <ActionTile s={s} t={t} Icon={GridIcon} pastel={pastels.mint} title={i18n('home_tile_masterdata_title')} sub={i18n('home_tile_masterdata_sub')} onPress={() => navigation.navigate('MasterData')} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={s.sectionTitle}>{i18n('home_section_manual_input')}</Text>
          <View style={s.manualCard}>
            <View style={s.manualInputWrap}>
              <SearchIcon size={18} color={t.muted} />
              <TextInput
                style={s.manualInput}
                placeholder={i18n('home_placeholder_manual')}
                placeholderTextColor={t.muted}
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="none"
                onSubmitEditing={openManual}
              />
            </View>
            <TouchableOpacity style={[s.manualBtn, loading && { opacity: 0.6 }]} onPress={openManual} disabled={loading}>
              <Text style={s.manualBtnText}>{loading ? '…' : i18n('home_button_search')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()} style={s.cacheRow}>
          <MapPinIcon size={15} color={t.muted} />
          <Text style={s.cacheText}>{i18n('home_cache_text', { count: cacheCount, date: cacheSyncedAt ? formatSyncedAt(cacheSyncedAt) : i18n('home_cache_never_synced') })}</Text>
          <TouchableOpacity
            onPress={refreshCustomerCache}
            disabled={refreshingCache || !isOnline}
            style={[s.cacheBtn, (refreshingCache || !isOnline) && { opacity: 0.5 }]}
          >
            <Text style={s.cacheBtnText}>{refreshingCache ? '…' : i18n('home_button_refresh_cache')}</Text>
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

    graceBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  graceBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Medium',
    textAlign: 'center',
  },
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


