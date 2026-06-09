import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { DialogRequest, _setDialogHandler } from '../utils/dialog';

/**
 * Host dialog global — render sekali di root. Menampilkan modal in-app yang rapi
 * (web + native) untuk confirmDialog/alertDialog. Pengganti window.confirm/alert & Alert.alert.
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

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => close(false)}>
      <Pressable style={styles.overlay} onPress={() => isConfirm && close(false)}>
        <Pressable style={[styles.card, { backgroundColor: t.surface }]} onPress={() => {}}>
          <Text style={[styles.title, { color: t.text }]}>{req.title}</Text>
          {!!req.message && <Text style={[styles.message, { color: t.muted }]}>{req.message}</Text>}
          <View style={styles.buttons}>
            {isConfirm && (
              <Pressable
                style={({ pressed }) => [styles.btn, styles.btnGhost, { borderColor: t.border }, pressed && { opacity: 0.6 }]}
                onPress={() => close(false)}
              >
                <Text style={[styles.btnGhostText, { color: t.muted }]}>{req.cancelText || 'Batal'}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.btn, { backgroundColor: t.primary }, pressed && { opacity: 0.85 }]}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: {
    width: '100%', maxWidth: 380, borderRadius: 18, padding: 22,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 12,
  },
  title: { fontSize: 17, fontWeight: '800' },
  message: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 },
  btn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, minWidth: 84, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5 },
  btnGhostText: { fontWeight: '700', fontSize: 14 },
});
