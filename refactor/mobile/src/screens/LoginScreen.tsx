import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LANG_KEY, Language } from '../i18n';
import { useAuth } from '../auth/AuthContext';
import { apiErrorMessage } from '../api/client';
import { alertDialog } from '../utils/dialog';
import { fonts, palette, radius, shadow, Theme } from '../theme';
import { useTheme, useThemeMode } from '../ThemeContext';
import Constants from 'expo-constants';
import WaveBackground from '../components/ui/WaveBackground';
import { CheckIcon, DropMark, EyeIcon, EyeOffIcon, MoonIcon, SunIcon } from '../components/ui/Icons';

const APP_VERSION = Constants.expoConfig?.version ?? '1.5.0';

const { height: SCREEN_H } = Dimensions.get('window');
const REMEMBER_KEY = 'meterair_remember';

export default function LoginScreen() {
  const { t } = useTranslation();
  const th = useTheme();
  const s = useMemo(() => createStyles(th), [th]);
  const { mode, toggle } = useThemeMode();
  const { login } = useAuth();

  const [kode, setKode] = useState('BUMDES-KRK');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>(i18n.language as Language);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Load saved credentials on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(REMEMBER_KEY);
        if (saved) {
          const { kode: k, username: u, remember } = JSON.parse(saved);
          if (remember) {
            if (k) setKode(k);
            if (u) setUsername(u);
            setRememberMe(true);
          }
        }
      } catch {}
    })();
  }, []);

  async function toggleLang() {
    const next: Language = lang === 'id' ? 'en' : 'id';
    await i18n.changeLanguage(next);
    await AsyncStorage.setItem(LANG_KEY, next);
    setLang(next);
  }

  function onForgotPassword() {
    alertDialog(t('login_forgot_title'), t('login_forgot_message'));
  }

  // Auto-isi kredensial demo (tenant DEMO, di-reset tiap malam).
  function demoLogin(user: string) {
    setKode('DEMO');
    setUsername(user);
    setPassword('password123');
    setError(null);
  }

  async function onSubmit() {
    if (!kode.trim()) { setError(t('login_error_company_code_required')); return; }
    if (!username) { setError(t('login_error_credentials_required')); return; }
    if (!password) { setError(t('login_error_credentials_required')); return; }
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password, kode.trim().toUpperCase());
      // Save or clear remember me
      await AsyncStorage.setItem(REMEMBER_KEY, JSON.stringify({
        kode: kode.trim().toUpperCase(),
        username: username.trim(),
        remember: rememberMe,
      }));
    } catch (e) {
      setError(apiErrorMessage(e, t('login_error_login_failed')));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      <WaveBackground height={SCREEN_H}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Top bar: language + dark mode */}
          <View style={s.topBar}>
            <TouchableOpacity onPress={toggleLang} style={s.langBtn} activeOpacity={0.8}>
              <Text style={s.langText}>{lang === 'id' ? '🇮🇩 ID' : '🇺🇸 EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggle} style={s.toggle} activeOpacity={0.8}>
              {mode === 'dark' ? <SunIcon size={18} color={palette.white} /> : <MoonIcon size={17} color={palette.white} />}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Spacer atas agar konten ter-center */}
              <View style={{ flex: 1, justifyContent: 'center' }}>
              {/* Brand */}
              <View style={s.brandWrap}>
                <View style={s.mark}><DropMark size={46} color={palette.white} /></View>
                <Text style={s.title}>{t('login_title')}</Text>
                <Text style={s.subtitle}>{t('login_subtitle')}</Text>
              </View>

              {/* Card */}
              <View style={s.card}>
                {error && (
                  <View style={s.errorBox}>
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                {/* Kode perusahaan */}
                <Text style={s.label}>{t('login_label_company_code')}</Text>
                <TextInput
                  style={s.input}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={kode}
                  onChangeText={(v) => setKode(v.toUpperCase())}
                  placeholder={t('login_placeholder_company_code')}
                  placeholderTextColor={th.muted}
                  returnKeyType="next"
                  onSubmitEditing={() => usernameRef.current?.focus()}
                />

                {/* Username */}
                <Text style={s.label}>{t('login_label_username')}</Text>
                <TextInput
                  ref={usernameRef}
                  style={s.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t('login_placeholder_username')}
                  placeholderTextColor={th.muted}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />

                {/* Password + show/hide */}
                <Text style={s.label}>{t('login_label_password')}</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    ref={passwordRef}
                    style={[s.input, s.passwordInput]}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('login_placeholder_password')}
                    placeholderTextColor={th.muted}
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                  />
                  <TouchableOpacity
                    style={s.eyeBtn}
                    onPress={() => setShowPassword((v) => !v)}
                    activeOpacity={0.7}
                  >
                    {showPassword
                      ? <EyeOffIcon size={20} color={th.muted} />
                      : <EyeIcon size={20} color={th.muted} />
                    }
                  </TouchableOpacity>
                </View>

                {/* Remember me + Forgot password */}
                <View style={s.optionsRow}>
                  <TouchableOpacity
                    style={s.rememberRow}
                    onPress={() => setRememberMe((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.checkbox, rememberMe && { backgroundColor: th.primary, borderColor: th.primary }]}>
                      {rememberMe && <CheckIcon size={12} color="#fff" strokeWidth={3} />}
                    </View>
                    <Text style={s.rememberText}>{t('login_remember_me')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
                    <Text style={s.forgotText}>{t('login_forgot_password')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onSubmit}
                  disabled={loading}
                  style={{ marginTop: 20 }}
                >
                  <LinearGradient
                    colors={th.scan}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[s.button, loading && { opacity: 0.7 }, shadow.glow]}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={s.buttonText}>{t('login_button_submit')}</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                {/* Panel akun demo */}
                <View style={s.demoPanel}>
                  <Text style={s.demoTitle}>🎬 {t('login_demo_title')}</Text>
                  <Text style={s.demoHint}>{t('login_demo_hint')}</Text>
                  <View style={s.demoGrid}>
                    {(['demo_admin', 'demo_manajer', 'demo_kasir', 'demo_petugas'] as const).map((u) => (
                      <TouchableOpacity key={u} style={s.demoBtn} onPress={() => demoLogin(u)} activeOpacity={0.85}>
                        <Text style={s.demoBtnText}>{u.replace('demo_', '').replace(/^\w/, (c) => c.toUpperCase())}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              </View>{/* end flex center */}
            </ScrollView>
          </KeyboardAvoidingView>
          {/* Footer — outside ScrollView, always visible */}
          <View style={s.footerWrap}>
            <View style={s.divider} />
            <Text style={s.footBrand}>Powered by Anugrah Solusi Digital</Text>
            <Text style={s.footVersion}>v{APP_VERSION}  ·  {t('login_footer')} · {new Date().getFullYear()}</Text>
          </View>
        </SafeAreaView>
      </WaveBackground>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, gap: 8 },
    demoPanel: { marginTop: 18, padding: 12, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.10)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.35)' },
    demoTitle: { fontFamily: fonts.bold, fontSize: 13, color: t.text },
    demoHint: { fontFamily: fonts.regular, fontSize: 11.5, color: t.muted, marginTop: 2, marginBottom: 8 },
    demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    demoBtn: { flexGrow: 1, minWidth: '46%', alignItems: 'center', paddingVertical: 9, borderRadius: 10, backgroundColor: '#15803d' },
    demoBtnText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 12.5 },
    langBtn: {
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    },
    langText: { color: palette.white, fontSize: 13, fontFamily: fonts.semibold },
    toggle: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
      alignItems: 'center', justifyContent: 'center',
    },
    scroll: { flexGrow: 1, padding: 18, paddingBottom: 10 },
    brandWrap: { alignItems: 'center', marginBottom: 16 },
    mark: {
      width: 62, height: 62, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
      alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 30, fontFamily: fonts.displayBlack, color: palette.white, marginTop: 10, letterSpacing: -1 },
    subtitle: { fontSize: 11.5, color: palette.foam, marginTop: 3, fontFamily: fonts.medium, letterSpacing: 0.3 },
    card: {
      backgroundColor: t.surface, borderRadius: radius.lg, padding: 16,
      borderWidth: 1, borderColor: t.border, ...shadow.float,
    },
    label: { fontSize: 12, color: t.muted, marginBottom: 5, marginTop: 10, fontFamily: fonts.semibold },
    input: {
      borderWidth: 1, borderColor: t.border, borderRadius: radius.sm,
      paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 15, color: t.text, backgroundColor: t.surfaceAlt, fontFamily: fonts.medium,
    },
    passwordRow: { position: 'relative' },
    passwordInput: { paddingRight: 44 },
    eyeBtn: {
      position: 'absolute', right: 12, top: 0, bottom: 0,
      justifyContent: 'center', alignItems: 'center', width: 32,
    },
    optionsRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 10,
    },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    checkbox: {
      width: 16, height: 16, borderRadius: 4,
      borderWidth: 1.5, borderColor: t.border,
      backgroundColor: t.surfaceAlt,
      alignItems: 'center', justifyContent: 'center',
    },
    rememberText: { fontSize: 12, color: t.muted, fontFamily: fonts.medium },
    forgotText: { fontSize: 12, color: t.primary, fontFamily: fonts.semibold },
    button: { borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 15, fontFamily: fonts.bold },
    errorBox: { backgroundColor: t.danger + '22', padding: 9, borderRadius: radius.sm, marginBottom: 4 },
    errorText: { color: t.danger, fontSize: 12, fontFamily: fonts.medium },
    footerWrap: { alignItems: 'center', marginTop: 12, paddingBottom: 12 },
    foot: { textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: fonts.regular },
    divider: { width: 40, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8 },
    footBrand: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 11, fontFamily: fonts.semibold, letterSpacing: 0.3 },
    footVersion: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 3, fontFamily: fonts.regular },
  });


