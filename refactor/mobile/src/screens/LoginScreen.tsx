import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { apiErrorMessage } from '../api/client';
import { fonts, palette, radius, shadow, Theme } from '../theme';
import { useTheme, useThemeMode } from '../ThemeContext';
import WaveBackground from '../components/ui/WaveBackground';
import { DropMark, MoonIcon, SunIcon } from '../components/ui/Icons';

const { height: SCREEN_H } = Dimensions.get('window');

export default function LoginScreen() {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const { mode, toggle } = useThemeMode();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!username || !password) {
      setError('Username dan password wajib diisi');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (e) {
      setError(apiErrorMessage(e, 'Login gagal'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <WaveBackground height={SCREEN_H}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={s.topBar}>
            <TouchableOpacity onPress={toggle} style={s.toggle} activeOpacity={0.8}>
              {mode === 'dark' ? <SunIcon size={18} color={palette.white} /> : <MoonIcon size={17} color={palette.white} />}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
              <View style={s.brandWrap}>
                <View style={s.mark}>
                  <DropMark size={46} color={palette.white} />
                </View>
                <Text style={s.title}>Meter Air</Text>
                <Text style={s.subtitle}>Aplikasi Petugas Pencatat Meter</Text>
              </View>

              <View style={s.card}>
                {error && (
                  <View style={s.errorBox}>
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                <Text style={s.label}>Username</Text>
                <TextInput
                  style={s.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor={t.muted}
                />

                <Text style={s.label}>Password</Text>
                <TextInput
                  style={s.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••"
                  placeholderTextColor={t.muted}
                  onSubmitEditing={onSubmit}
                />

                <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} disabled={loading} style={{ marginTop: 22 }}>
                  <LinearGradient
                    colors={t.scan}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[s.button, loading && { opacity: 0.7 }, shadow.glow]}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Masuk</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text style={s.foot}>Koneksi aman · TIRTA · {new Date().getFullYear()}</Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </WaveBackground>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 18, paddingTop: 6 },
    toggle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    brandWrap: { alignItems: 'center', marginBottom: 26 },
    mark: {
      width: 86,
      height: 86,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { fontSize: 40, fontFamily: fonts.displayBlack, color: palette.white, marginTop: 16, letterSpacing: -1 },
    subtitle: { fontSize: 12.5, color: palette.foam, marginTop: 5, fontFamily: fonts.medium, letterSpacing: 0.3 },
    card: {
      backgroundColor: t.surface,
      borderRadius: radius.xl,
      padding: 22,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.float,
    },
    label: { fontSize: 13, color: t.muted, marginBottom: 7, marginTop: 14, fontFamily: fonts.semibold },
    input: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 16,
      color: t.text,
      backgroundColor: t.surfaceAlt,
      fontFamily: fonts.medium,
    },
    button: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontFamily: fonts.bold },
    errorBox: { backgroundColor: t.danger + '22', padding: 11, borderRadius: radius.sm },
    errorText: { color: t.danger, fontSize: 13, fontFamily: fonts.medium },
    foot: { textAlign: 'center', color: 'rgba(231,247,247,0.7)', fontSize: 11.5, marginTop: 22, fontFamily: fonts.regular },
  });
