import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { fonts, pastels, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { CHANGELOG, changelogLines } from '../data/changelog';

const APP_VERSION = Constants.expoConfig?.version ?? '1.5.0';

export default function AboutScreen() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const s = useMemo(() => createStyles(t), [t]);
  const lang = i18n.language;
  // 'checking' | 'available' | 'latest' | 'dev' | 'idle'
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'latest' | 'dev'>('idle');
  const [busy, setBusy] = useState(false);

  async function lookForUpdate(silent: boolean) {
    if (!Updates.isEnabled) {
      setStatus('dev');
      return;
    }
    setStatus('checking');
    try {
      const res = await Updates.checkForUpdateAsync();
      setStatus(res.isAvailable ? 'available' : 'latest');
    } catch {
      setStatus('idle');
      if (!silent) Alert.alert(tr('about_update_title'), tr('about_update_failed'));
    }
  }

  // Auto-cek begitu layar dibuka — user langsung tahu ada update atau tidak.
  useEffect(() => {
    lookForUpdate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPressUpdate() {
    if (busy) return;
    if (status === 'available') {
      // Unduh + muat ulang langsung (tanpa reinstall).
      setBusy(true);
      try {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch {
        setBusy(false);
        Alert.alert(tr('about_update_title'), tr('about_update_failed'));
      }
    } else {
      lookForUpdate(false);
    }
  }

  const updIcon = busy
    ? 'sync'
    : status === 'available'
      ? 'arrow-down-circle'
      : status === 'checking'
        ? 'sync'
        : status === 'latest'
          ? 'checkmark-circle'
          : 'cloud-download-outline';
  const updLabel = busy
    ? tr('about_update_downloading')
    : status === 'available'
      ? tr('about_update_available')
      : status === 'checking'
        ? tr('about_update_checking')
        : status === 'latest'
          ? tr('about_update_uptodate')
          : status === 'dev'
            ? tr('about_update_dev')
            : tr('about_update_check');
  const isHot = status === 'available' && !busy;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {/* Header versi */}
      <View style={s.head}>
        <View style={s.logo}>
          <Ionicons name="water" size={34} color="#fff" />
        </View>
        <Text style={s.appName}>Meter Air</Text>
        <Text style={s.version}>v{APP_VERSION}</Text>
        <Text style={s.publisher}>Anugrah Solusi Digital</Text>
      </View>

      {/* Cek / terapkan pembaruan (auto-cek saat buka) */}
      <TouchableOpacity
        style={[s.updateBtn, isHot && s.updateBtnHot, (status === 'checking' || busy) && { opacity: 0.6 }]}
        onPress={onPressUpdate}
        disabled={status === 'checking' || busy}
        activeOpacity={0.85}
      >
        <Ionicons name={updIcon as any} size={20} color={isHot ? '#fff' : t.primary} />
        <Text style={[s.updateBtnText, isHot && { color: '#fff' }]}>{updLabel}</Text>
      </TouchableOpacity>

      {/* Persyaratan perangkat */}
      <View style={s.reqCard}>
        <View style={s.reqRow}>
          <Ionicons name="phone-portrait-outline" size={16} color={t.primary} />
          <Text style={s.reqTitle}>{tr('about_req_title')}</Text>
        </View>
        <View style={s.reqLine}>
          <Ionicons name="logo-android" size={14} color={t.muted} />
          <Text style={s.reqText}>{tr('about_req_os')}</Text>
        </View>
        <View style={s.reqLine}>
          <Ionicons name="hardware-chip-outline" size={14} color={t.muted} />
          <Text style={s.reqText}>{tr('about_req_cpu')}</Text>
        </View>
      </View>

      {/* Changelog */}
      <Text style={s.sectionTitle}>{tr('about_changelog_title')}</Text>
      {CHANGELOG.map((entry, idx) => (
        <View key={entry.version + entry.date} style={[s.entry, idx === 0 && s.entryLatest]}>
          <View style={s.entryHead}>
            <View style={[s.verBadge, idx === 0 ? s.verBadgeLatest : null]}>
              <Text style={[s.verBadgeText, idx === 0 && { color: '#fff' }]}>v{entry.version}</Text>
            </View>
            <Text style={s.entryDate}>{entry.date}</Text>
            {idx === 0 && <Text style={s.newTag}>{tr('about_new_tag')}</Text>}
          </View>
          {changelogLines(entry, lang).map((line, i) => (
            <View key={i} style={s.lineRow}>
              <Ionicons name="checkmark-circle" size={15} color={pastels.mint.fg} style={{ marginTop: 1 }} />
              <Text style={s.lineText}>{line}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    head: { alignItems: 'center', paddingVertical: 16 },
    logo: {
      width: 72, height: 72, borderRadius: 26, backgroundColor: t.primary,
      alignItems: 'center', justifyContent: 'center', ...shadow.glow,
    },
    appName: { color: t.text, fontFamily: fonts.displayBold, fontSize: 22, marginTop: 12 },
    version: { color: t.primary, fontFamily: fonts.bold, fontSize: 14, marginTop: 2 },
    publisher: { color: t.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 4 },

    updateBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: t.surface, borderRadius: radius.lg, paddingVertical: 14,
      borderWidth: 1.5, borderColor: t.primary + '55', marginTop: 8, marginBottom: 22,
      ...shadow.soft,
    },
    updateBtnHot: { backgroundColor: t.primary, borderColor: t.primary, ...shadow.glow },
    updateBtnText: { color: t.primary, fontFamily: fonts.bold, fontSize: 14 },

    reqCard: {
      backgroundColor: t.surface, borderRadius: radius.lg, padding: 14, marginBottom: 22,
      borderWidth: 1, borderColor: t.border, ...shadow.soft,
    },
    reqRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    reqTitle: { color: t.text, fontFamily: fonts.bold, fontSize: 14 },
    reqLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
    reqText: { color: t.muted, fontFamily: fonts.regular, fontSize: 13 },

    sectionTitle: { color: t.text, fontFamily: fonts.displayBold, fontSize: 17, marginBottom: 12 },
    entry: {
      backgroundColor: t.surface, borderRadius: radius.lg, padding: 14, marginBottom: 12,
      borderWidth: 1, borderColor: t.border, ...shadow.soft,
    },
    entryLatest: { borderColor: t.primary + '55' },
    entryHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    verBadge: { backgroundColor: t.chip, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
    verBadgeLatest: { backgroundColor: t.primary },
    verBadgeText: { color: t.text, fontFamily: fonts.extrabold, fontSize: 12 },
    entryDate: { color: t.muted, fontFamily: fonts.medium, fontSize: 12, flex: 1 },
    newTag: {
      color: pastels.mint.fg, backgroundColor: pastels.mint.bg, fontFamily: fonts.bold, fontSize: 10,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, overflow: 'hidden',
    },
    lineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
    lineText: { flex: 1, color: t.text, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  });
