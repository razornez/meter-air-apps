import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { DialogRequest, _setDialogHandler } from '../utils/dialog';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Emoji di awal judul → ikon VEKTOR (crisp) + warna aksen. */
const VARIANTS: Record<string, { fg: string; bg: string; icon: IconName }> = {
  '✅': { fg: '#16a34a', bg: '#dcfce7', icon: 'checkmark-circle' },
  '🎉': { fg: '#16a34a', bg: '#dcfce7', icon: 'sparkles' },
  '❌': { fg: '#dc2626', bg: '#fee2e2', icon: 'close-circle' },
  '⚠️': { fg: '#d97706', bg: '#fef3c7', icon: 'alert-circle' },
  'ℹ️': { fg: '#2563eb', bg: '#dbeafe', icon: 'information-circle' },
};

/**
 * Host dialog global — modal in-app rapi (web + native) untuk confirm/alert/prompt.
 * Pengganti window.confirm/alert/prompt & Alert.alert.
 */
export function DialogHost() {
  const t = useTheme();
  const [req, setReq] = useState<DialogRequest | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    _setDialogHandler((r) => setReq(r));
    return () => _setDialogHandler(null);
  }, []);

  useEffect(() => { setInput(''); }, [req]);

  function close(result: boolean | string | null) {
    req?.resolve(result);
    setReq(null);
  }

  if (!req) return null;
  const isConfirm = req.type === 'confirm';
  const isPrompt = req.type === 'prompt';
  const hasCancel = isConfirm || isPrompt;

  const rawTitle = req.title ?? '';
  const emojiKey = Object.keys(VARIANTS).find((e) => rawTitle.trimStart().startsWith(e));
  const variant = emojiKey ? VARIANTS[emojiKey] : null;
  const title = emojiKey ? rawTitle.replace(emojiKey, '').trim() : rawTitle;
  const accent = variant?.fg ?? t.primary;
  // Prompt wajib (mis. alasan batal lunas): tombol konfirmasi nonaktif sampai diisi.
  const confirmDisabled = isPrompt && !!req.required && !input.trim();

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => close(isPrompt ? null : false)}>
      <Pressable style={styles.overlay} onPress={() => hasCancel && close(isPrompt ? null : false)}>
        <Pressable style={[styles.card, { backgroundColor: t.surface }]} onPress={() => {}}>
          {variant && (
            <View style={[styles.iconWrap, { backgroundColor: variant.bg }]}>
              <Ionicons name={variant.icon} size={38} color={variant.fg} />
            </View>
          )}
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          {!!req.message && <Text style={[styles.message, { color: t.muted }]}>{req.message}</Text>}
          {isPrompt && (
            <TextInput
              style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.bg }]}
              value={input}
              onChangeText={setInput}
              placeholder={req.placeholder}
              placeholderTextColor={t.muted}
              autoFocus
              multiline
            />
          )}
          <View style={styles.buttons}>
            {hasCancel && (
              <Pressable
                style={({ pressed }) => [styles.btn, { backgroundColor: t.bg }, pressed && { opacity: 0.6 }]}
                onPress={() => close(isPrompt ? null : false)}
              >
                <Text style={[styles.btnText, { color: t.muted }]}>{req.cancelText || 'Batal'}</Text>
              </Pressable>
            )}
            <Pressable
              disabled={confirmDisabled}
              style={({ pressed }) => [
                styles.btn, styles.btnPrimary, { backgroundColor: accent },
                confirmDisabled && { opacity: 0.45 },
                pressed && !confirmDisabled && { opacity: 0.88 },
              ]}
              onPress={() => { if (!confirmDisabled) close(isPrompt ? input.trim() : true); }}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>{req.confirmText || 'OK'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: {
    width: '100%', maxWidth: 352, borderRadius: 26, paddingTop: 28, paddingBottom: 18, paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#0f172a', shadowOpacity: 0.28, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 18,
  },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 19, fontWeight: '800', textAlign: 'center', letterSpacing: -0.2 },
  message: { fontSize: 14.5, lineHeight: 21, marginTop: 7, textAlign: 'center' },
  input: { alignSelf: 'stretch', marginTop: 16, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, minHeight: 52, textAlignVertical: 'top' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { shadowColor: '#0f172a', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  btnText: { fontWeight: '800', fontSize: 15 },
});
