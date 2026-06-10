import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { DialogRequest, _setDialogHandler } from '../utils/dialog';

/** Emoji di awal judul → ikon (lingkaran berwarna) + warna tombol utama. */
const VARIANTS: Record<string, { fg: string; bg: string }> = {
  '✅': { fg: '#16a34a', bg: '#dcfce7' },
  '🎉': { fg: '#16a34a', bg: '#dcfce7' },
  '❌': { fg: '#dc2626', bg: '#fee2e2' },
  '⚠️': { fg: '#d97706', bg: '#fef3c7' },
  'ℹ️': { fg: '#2563eb', bg: '#dbeafe' },
};

/**
 * Host dialog global — render sekali di root. Modal in-app yang rapi (web + native)
 * untuk confirmDialog/alertDialog. Pengganti window.confirm/alert & Alert.alert.
 */
export function DialogHost() {
  const t = useTheme();
  const [req, setReq] = useState<DialogRequest | null>(null);

  useEffect(() => {
    _setDialogHandler((r) => setReq(r));
    return () => _setDialogHandler(null);
  }, []);

  function close(ok: boolean) {
    req?.resolve(ok);
    setReq(null);
  }

  if (!req) return null;
  const isConfirm = req.type === 'confirm';

  // Deteksi emoji di awal judul → jadikan ikon, lalu bersihkan dari teks judul.
  const rawTitle = req.title ?? '';
  const emojiKey = Object.keys(VARIANTS).find((e) => rawTitle.trimStart().startsWith(e));
  const variant = emojiKey ? VARIANTS[emojiKey] : null;
  const title = emojiKey ? rawTitle.replace(emojiKey, '').trim() : rawTitle;
  const primary = variant?.fg ?? t.primary;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => close(false)}>
      <Pressable style={styles.overlay} onPress={() => isConfirm && close(false)}>
        <Pressable style={[styles.card, { backgroundColor: t.surface }]} onPress={() => {}}>
          {variant && (
            <View style={[styles.iconWrap, { backgroundColor: variant.bg }]}>
              <Text style={styles.iconText}>{emojiKey}</Text>
            </View>
          )}
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          {!!req.message && <Text style={[styles.message, { color: t.muted }]}>{req.message}</Text>}
          <View style={styles.buttons}>
            {isConfirm && (
              <Pressable
                style={({ pressed }) => [styles.btn, styles.btnGhost, { borderColor: t.border }, pressed && { opacity: 0.55 }]}
                onPress={() => close(false)}
              >
                <Text style={[styles.btnGhostText, { color: t.text }]}>{req.cancelText || 'Batal'}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.btn, { backgroundColor: primary }, pressed && { opacity: 0.85 }]}
              onPress={() => close(true)}
            >
              <Text style={styles.btnText}>{req.confirmText || 'OK'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: {
    width: '100%', maxWidth: 360, borderRadius: 24, paddingTop: 26, paddingBottom: 18, paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#0f172a', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 16,
  },
  iconWrap: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  iconText: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  message: { fontSize: 14.5, lineHeight: 22, marginTop: 8, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 24, alignSelf: 'stretch' },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5 },
  btnGhostText: { fontWeight: '700', fontSize: 15 },
});
