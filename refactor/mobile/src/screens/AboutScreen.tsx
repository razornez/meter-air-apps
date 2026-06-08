import React, { useMemo, useState } from 'react';
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
  const [checking, setChecking] = useState(false);

  async function checkUpdate() {
    if (!Updates.isEnabled) {
      Alert.alert(tr('about_update_title'), tr('about_update_dev'));
      return;
    }
    setChecking(true);
    try {
      const res = await Updates.checkForUpdateAsync();
      if (res.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert(tr('about_update_ready_title'), tr('about_update_ready_msg'), [
          { text: tr('about_update_reload'), onPress: () => Updates.reloadAsync() },
        ]);
      } else {
        Alert.alert(tr('about_update_title'), tr('about_update_latest'));
      }
    } catch {
      Alert.alert(tr('about_update_title'), tr('about_update_failed'));
    } finally {
      setChecking(false);
    }
  }

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

      {/* Cek pembaruan */}
      <TouchableOpacity style={[s.updateBtn, checking && { opacity: 0.6 }]} onPress={checkUpdate} disabled={checking} activeOpacity={0.85}>
        <Ionicons name={checking ? 'sync' : 'cloud-download-outline'} size={20} color={t.primary} />
        <Text style={s.updateBtnText}>{checking ? tr('about_update_checking') : tr('about_update_check')}</Text>
      </TouchableOpacity>

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
    updateBtnText: { color: t.primary, fontFamily: fonts.bold, fontSize: 14 },

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
