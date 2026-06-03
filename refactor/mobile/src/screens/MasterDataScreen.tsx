import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiListProduk, apiListSupplier } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { ProdukItem, SupplierItem } from '../types';
import { fonts, formatRupiah, radius, shadow, Theme } from '../theme';
import { useTheme } from '../ThemeContext';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';
import { SearchIcon } from '../components/ui/Icons';

type Tab = 'produk' | 'supplier';
type Row = ProdukItem | SupplierItem;

export default function MasterDataScreen() {
  const t = useTheme();
  const s = useMemo(() => createStyles(t), [t]);
  const [tab, setTab] = useState<Tab>('produk');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (which: Tab, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res =
        which === 'produk'
          ? await apiListProduk({ search: q || undefined, limit: 50 })
          : await apiListSupplier({ search: q || undefined, limit: 50 });
      setItems(res.data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => load(tab, search), 300);
    return () => clearTimeout(id);
  }, [tab, search, load]);

  const Seg = ({ label, value }: { label: string; value: Tab }) => {
    const active = tab === value;
    return (
      <TouchableOpacity style={[s.seg, active && s.segActive]} onPress={() => setTab(value)} activeOpacity={0.85}>
        <Text style={[s.segText, active && s.segTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.segment}>
        <Seg label="Produk" value="produk" />
        <Seg label="Supplier" value="supplier" />
      </View>
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <SearchIcon size={18} color={t.muted} />
          <TextInput
            style={s.search}
            placeholder={`Cari ${tab}`}
            placeholderTextColor={t.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>
      </View>

      {loading && items.length === 0 ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(tab, search)} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => `${tab}-${it.id}`}
          contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 14, gap: 10 }}
          ListEmptyComponent={<EmptyState label={`Tidak ada ${tab}`} />}
          renderItem={({ item }) =>
            tab === 'produk' ? (
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{(item as ProdukItem).nama ?? '-'}</Text>
                  <Text style={s.meta}>{(item as ProdukItem).barcode ?? '-'} · stok {(item as ProdukItem).stok ?? '0'}</Text>
                </View>
                <Text style={s.price}>{formatRupiah((item as ProdukItem).hargaJual ?? 0)}</Text>
              </View>
            ) : (
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{(item as SupplierItem).nama ?? '-'}</Text>
                  {!!(item as SupplierItem).alamat && <Text style={s.meta}>{(item as SupplierItem).alamat}</Text>}
                </View>
                {!!(item as SupplierItem).telepon && <Text style={s.meta}>☎ {(item as SupplierItem).telepon}</Text>}
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    segment: { flexDirection: 'row', margin: 14, marginBottom: 8, backgroundColor: t.surfaceAlt, borderRadius: radius.md, padding: 4 },
    seg: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
    segActive: { backgroundColor: t.primary, ...shadow.soft },
    segText: { color: t.muted, fontFamily: fonts.bold, fontSize: 13.5 },
    segTextActive: { color: '#fff' },
    searchWrap: { paddingHorizontal: 14, paddingBottom: 6 },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 14,
      ...shadow.soft,
    },
    search: { flex: 1, paddingVertical: 12, color: t.text, fontFamily: fonts.regular, fontSize: 14 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow.soft,
    },
    name: { fontSize: 15, fontFamily: fonts.bold, color: t.text },
    meta: { fontSize: 12, color: t.muted, marginTop: 2, fontFamily: fonts.regular },
    price: { fontFamily: fonts.displayBold, color: t.primary, marginLeft: 8, fontSize: 14 },
  });
