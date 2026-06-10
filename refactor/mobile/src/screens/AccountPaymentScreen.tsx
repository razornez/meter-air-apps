import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/types';
import { apiFakturDetail, apiPay, apiSnapToken } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { alertDialog, confirmDialog } from '../utils/dialog';
import { snapPayWeb } from '../utils/snapPay';
import { BrandLogo } from '../components/BrandLogo';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountPayment'>;

export default function AccountPaymentScreen({ route, navigation }: Props) {
  const { t: tr } = useTranslation();
  const { noFaktur, amount, method } = route.params;
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const verifyCancel = useRef(false);

  const isMidtrans = method.type === 'midtrans';
  const hasAccount = !!method.accountNumber;

  function copyToClipboard(text: string, label: string) {
    Clipboard.setString(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  // Setelah Snap sukses: webhook menandai lunas asinkron (~10-15 dtk). Poll status sampai
  // lunas (atau ~30 dtk) supaya UI otomatis flip — tak perlu reload manual.
  async function verifyPaymentThenBack() {
    verifyCancel.current = false;
    setVerifying(true);
    let lunas = false;
    for (let i = 0; i < 12; i++) {
      if (verifyCancel.current) { setVerifying(false); return; } // user tekan Tutup
      try {
        const d = await apiFakturDetail(noFaktur);
        if (d?.isLunas) { lunas = true; break; }
      } catch { /* abaikan, coba lagi */ }
      await new Promise((r) => setTimeout(r, 2500));
    }
    if (verifyCancel.current) { setVerifying(false); return; }
    setVerifying(false);
    alertDialog(
      tr('account_payment_snap_success_title'),
      lunas ? tr('account_payment_paid_confirmed_msg') : tr('account_payment_snap_success_msg'),
    );
    navigation.pop(2);
  }

  function cancelVerify() {
    verifyCancel.current = true;
    setVerifying(false);
    navigation.pop(2);
  }

  async function onConfirm() {
    setConfirming(true);
    try {
      if (isMidtrans) {
        const res = await apiSnapToken(noFaktur);
        if (res.alreadyPaid) {
          alertDialog(tr('account_payment_alert_already_paid_title'), tr('account_payment_alert_already_paid_message'));
          navigation.pop(2);
          return;
        }

        // WEB: popup Snap.js in-app (tak buka tab baru, balik ke app otomatis).
        if (Platform.OS === 'web' && res.token && res.clientKey) {
          try {
            await snapPayWeb(res.token, res.clientKey, {
              // Apa pun cara keluar Snap → cek status faktur otomatis (webhook menandai lunas
              // server-side; user TAK perlu klik "check status"). Overlay punya tombol Tutup.
              onSuccess: () => { verifyPaymentThenBack(); },
              onPending: () => { verifyPaymentThenBack(); },
              onError: () => { alertDialog(tr('account_payment_alert_failed_title'), tr('account_payment_snap_error_msg')); },
              onClose: () => { verifyPaymentThenBack(); },
            });
            return;
          } catch {
            // Snap.js gagal dimuat → fallback buka redirectUrl di tab baru
            if (res.redirectUrl && typeof window !== 'undefined') { window.open(res.redirectUrl, '_blank'); return; }
          }
        }

        // NATIVE (atau fallback): buka WebView bila ada redirectUrl/token.
        if (res.redirectUrl || res.token) {
          navigation.replace('PaymentWebView', {
            noFaktur,
            snapToken: res.token ?? '',
            snapUrl: res.redirectUrl ?? undefined,
          });
        } else {
          alertDialog(tr('account_payment_alert_failed_title'), tr('account_payment_alert_no_url'));
        }
      } else {
        // E-wallet / bank: konfirmasi manual → tandai lunas
        const res = await apiPay(noFaktur, method.code);
        if (res.type === 'transfer' || res.type === 'ewallet' || res.type === 'bank_static') {
          const ok = await confirmDialog(
            tr('account_payment_alert_confirm_title'),
            tr('account_payment_alert_confirm_message', { noFaktur }),
            tr('account_payment_alert_confirm_ok'),
            tr('account_payment_alert_confirm_cancel'),
          );
          if (ok) {
            try {
              await apiPay(noFaktur, 'cash'); // tandai lunas via cash flow
              alertDialog(tr('account_payment_alert_paid_title'), tr('account_payment_alert_paid_message'));
              navigation.pop(2);
            } catch (e) {
              alertDialog(tr('account_payment_alert_failed_title'), apiErrorMessage(e));
            }
          }
        }
      }
    } catch (e) {
      alertDialog(tr('account_payment_alert_failed_title'), apiErrorMessage(e));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {/* Header brand */}
      <View style={[s.brandHeader, { backgroundColor: method.logoBg + '18' }]}>
        <BrandLogo logoBg={method.logoBg} logoText={method.logoText} logoUrl={method.logoUrl} size={64} radius={18} />
        <View style={s.brandInfo}>
          <Text style={s.brandName}>{method.name}</Text>
          <Text style={s.brandType}>
            {method.type === 'ewallet' ? tr('account_payment_brand_type_ewallet') : method.type === 'bank_static' ? tr('account_payment_brand_type_bank') : tr('account_payment_brand_type_gateway')}
          </Text>
        </View>
      </View>

      {/* Jumlah */}
      <View style={s.amountCard}>
        <Text style={s.amountLabel}>{tr('account_payment_amount_label')}</Text>
        <Text style={s.amountValue}>Rp {amount.toLocaleString('id-ID')}</Text>
        {!isMidtrans && (
          <TouchableOpacity style={s.copyAmountBtn} onPress={() => copyToClipboard(String(amount), 'nominal')} activeOpacity={0.8}>
            <Text style={s.copyAmountText}>{copied === 'nominal' ? tr('account_payment_button_copied') : tr('account_payment_button_copy_amount')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info rekening (bila ada) */}
      {hasAccount && (
        <View style={s.accountCard}>
          <Text style={s.accountTitle}>{tr('account_payment_account_title')}</Text>

          {/* Nomor rekening */}
          <View style={s.fieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>{tr(method.type === 'ewallet' ? 'account_payment_field_account_number_ewallet' : 'account_payment_field_account_number_bank', { name: method.name })}</Text>
              <Text style={s.fieldValue}>{method.accountNumber}</Text>
            </View>
            <TouchableOpacity
              style={[s.copyBtn, { backgroundColor: method.logoBg }]}
              onPress={() => copyToClipboard(method.accountNumber!, 'nomor')}
            >
              <Text style={s.copyText}>{copied === 'nomor' ? tr('account_payment_button_copied') : tr('account_payment_button_copy')}</Text>
            </TouchableOpacity>
          </View>

          {/* Nama rekening */}
          {!!method.accountName && (
            <View style={s.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>{tr('account_payment_field_account_name')}</Text>
                <Text style={s.fieldValue}>{method.accountName}</Text>
              </View>
              <TouchableOpacity
                style={[s.copyBtn, { backgroundColor: method.logoBg }]}
                onPress={() => copyToClipboard(method.accountName!, 'nama')}
              >
                <Text style={s.copyText}>{copied === 'nama' ? tr('account_payment_button_copied') : tr('account_payment_button_copy')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Petunjuk */}
      {!!method.instructions && (
        <View style={s.instrCard}>
          <Text style={s.instrTitle}>{tr('account_payment_instructions_title')}</Text>
          <Text style={s.instrText}>{method.instructions}</Text>
        </View>
      )}

      {/* Tidak ada nomor rekening — peringatan */}
      {!hasAccount && !isMidtrans && (
        <View style={s.warnCard}>
          <Text style={s.warnText}>
            {tr('account_payment_warn_no_account', { type: method.type === 'ewallet' ? 'e-wallet' : 'rekening' })}
          </Text>
        </View>
      )}

      {/* Tombol aksi */}
      <TouchableOpacity
        style={[s.actionBtn, { backgroundColor: isMidtrans ? method.logoBg : method.logoBg }, confirming && s.actionDisabled]}
        onPress={onConfirm}
        disabled={confirming}
        activeOpacity={0.85}
      >
        {confirming
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.actionText}>
              {isMidtrans ? tr('account_payment_button_pay_via', { name: method.name }) : tr('account_payment_button_confirm_transfer')}
            </Text>
        }
      </TouchableOpacity>

      {!isMidtrans && (
        <Text style={s.footNote}>{tr('account_payment_footnote')}</Text>
      )}
    </ScrollView>
      {verifying && (
        <View style={s.verifyOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.verifyText}>{tr('account_payment_verifying')}</Text>
          <TouchableOpacity onPress={cancelVerify} style={s.verifyClose} activeOpacity={0.8}>
            <Text style={s.verifyCloseText}>{tr('account_payment_verify_close')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' },
  brandHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 18, marginBottom: 16 },
  brandInfo: { flex: 1 },
  brandName: { fontSize: 22, fontWeight: '900', color: '#111827' },
  brandType: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  amountCard: {
    backgroundColor: '#111827', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#111827', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  amountLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  amountValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 6, letterSpacing: -0.5 },
  copyAmountBtn: { alignSelf: 'flex-start', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  copyAmountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  accountCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  accountTitle: { fontSize: 13, fontWeight: '800', color: '#374151', marginBottom: 4 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fieldLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  fieldValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 3, letterSpacing: 1 },
  copyBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  copyText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  instrCard: { backgroundColor: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  instrTitle: { fontSize: 13, fontWeight: '800', color: '#92400E', marginBottom: 6 },
  instrText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
  warnCard: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  warnText: { color: '#991B1B', fontSize: 13, lineHeight: 20 },
  actionBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  actionDisabled: { opacity: 0.5, shadowOpacity: 0 },
  actionText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  footNote: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 12, lineHeight: 18 },
  verifyOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17,24,39,0.82)', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  verifyText: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  verifyClose: { marginTop: 10, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' },
  verifyCloseText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
