import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { CHANGELOG, CHANGELOG_MARKER, changelogLines } from '../data/changelog';
import { fetchWeather, WeatherData } from '../utils/weather';
import i18nInstance, { LANG_KEY, Language } from '../i18n';
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
import { fonts, palette, radius, shadow, tracking, Theme } from '../theme';
import WaveBackground from '../components/ui/WaveBackground';
import { GlassCard } from '../components/ui/Cards';
import LiquidProgress from '../components/ui/LiquidProgress';
import {
  AlertIcon,
  ChevronIcon,
  GridIcon,
  ListCheckIcon,
  MapPinIcon,
  MoonIcon,
  PowerIcon,
  ScanIcon,
  SearchIcon,
  SunIcon,
  SyncIcon,
} from '../components/ui/Icons';
import { pastels } from '../theme';

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
  const [lang, setLang] = useState<Language>(i18nInstance.language as Language);

  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [whatsNew, setWhatsNew] = useState(false);

  // "Yang Baru" — tampil sekali tiap rilis (termasuk update OTA)
  const WHATSNEW_KEY = 'meterair_whatsnew_marker';
  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(WHATSNEW_KEY);
        if (seen !== CHANGELOG_MARKER) setWhatsNew(true);
      } catch {}
    })();
  }, []);

  async function dismissWhatsNew() {
    setWhatsNew(false);
    try { await AsyncStorage.setItem(WHATSNEW_KEY, CHANGELOG_MARKER); } catch {}
  }

  async function toggleLang() {
    const next: Language = lang === 'id' ? 'en' : 'id';
    await i18nInstance.changeLanguage(next);
    await AsyncStorage.setItem(LANG_KEY, next);
    setLang(next);
  }

  // Clock
  useEffect(() => {
    function tick() {
      const now = new Date();
      setClock(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Weather via GPS + Open-Meteo (gratis, no API key)
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const w = await fetchWeather(loc.coords.latitude, loc.coords.longitude, lang as 'id' | 'en');
        setWeather(w);
      } catch {}
    })();
  }, [lang]);

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
    <>
    <ScrollView keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: 'transparent' }}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ---- Wave hero ---- */}
      <WaveBackground height={340} style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={[s.heroInner, { paddingTop: insets.top + 10 }]}>
          <View style={s.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.hello}>{i18n('home_greeting')}</Text>
              <Text style={s.name} numberOfLines={1}>{user?.fullname ?? user?.username}</Text>
              <Text style={s.role}>{i18n('home_role')}</Text>
            </View>
            <View style={s.heroActions}>
              {/* Language toggle */}
              <TouchableOpacity onPress={toggleLang} style={s.langBtn} activeOpacity={0.8}>
                <Text style={s.langText}>{lang === 'id' ? '🇮🇩' : '🇺🇸'}</Text>
              </TouchableOpacity>
              {/* Tentang & Yang Baru */}
              <TouchableOpacity onPress={() => navigation.navigate('About')} style={s.iconBtn} activeOpacity={0.8}>
                <Ionicons name="information-circle-outline" size={21} color={palette.white} />
              </TouchableOpacity>
              {/* Dark mode toggle */}
              <TouchableOpacity onPress={toggle} style={s.iconBtn} activeOpacity={0.8}>
                {mode === 'dark' ? <SunIcon size={20} color={palette.white} /> : <MoonIcon size={19} color={palette.white} />}
              </TouchableOpacity>
              {/* Logout */}
              <TouchableOpacity onPress={logout} style={s.iconBtn} activeOpacity={0.8}>
                <PowerIcon size={20} color={palette.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Clock + Weather bar */}
          <View style={s.infoBar}>
            <View style={s.infoLeft}>
              <Text style={s.clockText}>{clock || '--:--:--'}</Text>
              <Text style={s.dateText}>{new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
            </View>
            {weather ? (
              <View style={s.weatherRight}>
                <Text style={s.weatherIcon}>{weather.icon}</Text>
                <View>
                  <Text style={s.weatherTemp}>{weather.temp}°C</Text>
                  <Text style={s.weatherDesc} numberOfLines={1}>{weather.description}</Text>
                </View>
              </View>
            ) : (
              <Text style={s.weatherLoading}>📡 {lang === 'id' ? 'Memuat cuaca...' : 'Loading weather...'}</Text>
            )}
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
            <ActionTile s={s} t={t} tileIndex={0} title={i18n('home_tile_worklist_title')} sub={i18n('home_tile_worklist_sub')} onPress={() => navigation.navigate('Worklist')} />
            <ActionTile s={s} t={t} tileIndex={1} title={i18n('home_tile_tunggakan_title')} sub={i18n('home_tile_tunggakan_sub')} onPress={() => navigation.navigate('Tunggakan')} />
            <ActionTile s={s} t={t} tileIndex={2} title={i18n('home_tile_anomaly_title')} sub={i18n('home_tile_anomaly_sub')} onPress={() => navigation.navigate('Anomaly')} />
            <ActionTile s={s} t={t} tileIndex={3} title={i18n('home_tile_masterdata_title')} sub={i18n('home_tile_masterdata_sub')} onPress={() => navigation.navigate('MasterData')} />
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

    {/* Modal "Yang Baru" — muncul sekali tiap rilis/update */}
    <Modal visible={whatsNew} transparent animationType="fade" onRequestClose={dismissWhatsNew}>
      <View style={s.wnOverlay}>
        <View style={s.wnCard}>
          <View style={s.wnIcon}><Ionicons name="sparkles" size={26} color={t.primary} /></View>
          <Text style={s.wnTitle}>{i18n('about_new_modal_title')}</Text>
          <Text style={s.wnVer}>v{CHANGELOG[0].version}</Text>
          <ScrollView style={{ maxHeight: 260, alignSelf: 'stretch' }} contentContainerStyle={{ paddingVertical: 4 }}>
            {changelogLines(CHANGELOG[0], lang).map((line, i) => (
              <View key={i} style={s.wnLine}>
                <Text style={s.wnBullet}>•</Text>
                <Text style={s.wnLineText}>{line}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.wnBtn} onPress={dismissWhatsNew} activeOpacity={0.85}>
            <Text style={s.wnBtnText}>{i18n('about_new_modal_ok')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

// Pastel vector tile: 0=Worklist, 1=Tunggakan, 2=Anomali, 3=MasterData
const TILE_PASTELS = [
  { ...pastels.lavender, Icon: ListCheckIcon },
  { ...pastels.peach,    Icon: AlertIcon },
  { ...pastels.mint,     Icon: ScanIcon },
  { ...pastels.sky,      Icon: GridIcon },
] as const;

function ActionTile({ s, t, tileIndex, title, sub, onPress }: {
  s: ReturnType<typeof createStyles>; t: Theme;
  tileIndex: number; title: string; sub: string; onPress: () => void;
}) {
  const p = TILE_PASTELS[tileIndex] ?? TILE_PASTELS[0];
  return (
    <TouchableOpacity style={s.tile} activeOpacity={0.85} onPress={onPress}>
      <View style={[s.tileIconWrap, { backgroundColor: p.bg }]}>
        <p.Icon size={28} color={p.fg} strokeWidth={2} />
      </View>
      <Text style={s.tileTitle}>{title}</Text>
      <Text style={s.tileSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    heroInner: { flex: 1, paddingHorizontal: 16, paddingBottom: 16, justifyContent: 'space-between' },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start' },
    heroActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    langBtn: {
      paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center', justifyContent: 'center',
    },
    langText: { fontSize: 16 },
    hello: { color: palette.foam, fontFamily: fonts.medium, fontSize: 11, letterSpacing: tracking.overline, textTransform: 'uppercase' },
    name: { color: palette.white, fontFamily: fonts.displayBlack, fontSize: 24, marginTop: 2, letterSpacing: tracking.display },
    role: { color: 'rgba(231,247,247,0.78)', fontFamily: fonts.medium, fontSize: 11, marginTop: 2 },
    iconBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
      alignItems: 'center', justifyContent: 'center',
    },
    infoBar: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 4, marginBottom: 2,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    },
    infoLeft: { gap: 1 },
    clockText: { color: palette.white, fontFamily: fonts.displayBold, fontSize: 18, letterSpacing: 1 },
    dateText: { color: 'rgba(231,247,247,0.75)', fontFamily: fonts.medium, fontSize: 10 },
    weatherRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    weatherIcon: { fontSize: 28 },
    weatherTemp: { color: palette.white, fontFamily: fonts.bold, fontSize: 16, textAlign: 'right' },
    weatherDesc: { color: 'rgba(231,247,247,0.8)', fontFamily: fonts.regular, fontSize: 10, textAlign: 'right', maxWidth: 90 },
    weatherLoading: { color: 'rgba(231,247,247,0.6)', fontFamily: fonts.regular, fontSize: 11 },
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
    tileIconWrap: {
      width: 52, height: 52, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 10,
    },
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

    // Modal "Yang Baru"
    wnOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    wnCard: { width: '100%', maxWidth: 380, backgroundColor: t.surface, borderRadius: radius.xl, padding: 22, alignItems: 'center', ...shadow.float },
    wnIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: t.badgeBg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    wnTitle: { color: t.text, fontFamily: fonts.displayBold, fontSize: 19 },
    wnVer: { color: t.primary, fontFamily: fonts.bold, fontSize: 13, marginTop: 2, marginBottom: 12 },
    wnLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4, paddingHorizontal: 4 },
    wnBullet: { color: t.primary, fontFamily: fonts.bold, fontSize: 15, lineHeight: 19 },
    wnLineText: { flex: 1, color: t.text, fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19 },
    wnBtn: { alignSelf: 'stretch', marginTop: 14, backgroundColor: t.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' },
    wnBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
  });





