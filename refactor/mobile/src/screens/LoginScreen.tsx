import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LANG_KEY, Language } from '../i18n';
import { useAuth } from '../auth/AuthContext';
import { apiErrorMessage } from '../api/client';
import { fonts, palette, radius, shadow, Theme } from '../theme';
import { useTheme, useThemeMode } from '../ThemeContext';
import WaveBackground from '../components/ui/WaveBackground';
import { CheckIcon, DropMark, EyeIcon, EyeOffIcon, MoonIcon, SunIcon } from '../components/ui/Icons';

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
    Alert.alert(t('login_forgot_title'), t('login_forgot_message'), [{ text: t('login_forgot_ok') }]);
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
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
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
              </View>

              <View style={s.footerWrap}>
                <Text style={s.foot}>{t('login_footer')} · {new Date().getFullYear()}</Text>
                <View style={s.divider} />
                <Text style={s.footBrand}>Powered by Anugrah Solusi Digital</Text>
                <Text style={s.footVersion}>v1.0.0</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </WaveBackground>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, gap: 8 },
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
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 32 },
    brandWrap: { alignItems: 'center', marginBottom: 26 },
    mark: {
      width: 86, height: 86, borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
      alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 40, fontFamily: fonts.displayBlack, color: palette.white, marginTop: 16, letterSpacing: -1 },
    subtitle: { fontSize: 12.5, color: palette.foam, marginTop: 5, fontFamily: fonts.medium, letterSpacing: 0.3 },
    card: {
      backgroundColor: t.surface, borderRadius: radius.xl, padding: 22,
      borderWidth: 1, borderColor: t.border, ...shadow.float,
    },
    label: { fontSize: 13, color: t.muted, marginBottom: 7, marginTop: 14, fontFamily: fonts.semibold },
    input: {
      borderWidth: 1, borderColor: t.border, borderRadius: radius.sm,
      paddingHorizontal: 14, paddingVertical: 13,
      fontSize: 16, color: t.text, backgroundColor: t.surfaceAlt, fontFamily: fonts.medium,
    },
    passwordRow: { position: 'relative' },
    passwordInput: { paddingRight: 48 },
    eyeBtn: {
      position: 'absolute', right: 14, top: 0, bottom: 0,
      justifyContent: 'center', alignItems: 'center', width: 36,
    },
    optionsRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 14,
    },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkbox: {
      width: 18, height: 18, borderRadius: 4,
      borderWidth: 1.5, borderColor: t.border,
      backgroundColor: t.surfaceAlt,
      alignItems: 'center', justifyContent: 'center',
    },
    rememberText: { fontSize: 13, color: t.muted, fontFamily: fonts.medium },
    forgotText: { fontSize: 13, color: t.primary, fontFamily: fonts.semibold },
    button: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontFamily: fonts.bold },
    errorBox: { backgroundColor: t.danger + '22', padding: 11, borderRadius: radius.sm, marginBottom: 4 },
    errorText: { color: t.danger, fontSize: 13, fontFamily: fonts.medium },
    footerWrap: { alignItems: 'center', marginTop: 20, paddingBottom: 16 },
    foot: { textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: fonts.regular },
    divider: { width: 40, height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8 },
    footBrand: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 11, fontFamily: fonts.semibold, letterSpacing: 0.3 },
    footVersion: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 3, fontFamily: fonts.regular },
  });
