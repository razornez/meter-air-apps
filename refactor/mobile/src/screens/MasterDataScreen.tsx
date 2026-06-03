import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiListProduk, apiListSupplier } from '../api/services';
import { apiErrorMessage } from '../api/client';
import { ProdukItem, SupplierItem } from '../types';
import { colors, formatRupiah } from '../theme';
import { EmptyState, ErrorState, Loading } from '../components/ScreenStates';

type Tab = 'produk' | 'supplier';
type Row = ProdukItem | SupplierItem;

export default function MasterDataScreen() {
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
    const t = setTimeout(() => load(tab, search), 300);
    return () => clearTimeout(t);
  }, [tab, search, load]);

  return (
    <View style={styles.container}>
      <View style={styles.segment}>
        <Seg label="Produk" active={tab === 'produk'} onPress={() => setTab('produk')} />
        <Seg
          label="Supplier"
          active={tab === 'supplier'}
          onPress={() => setTab('supplier')}
        />
      </View>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder={`Cari ${tab}`}
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {loading && items.length === 0 ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(tab, search)} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => `${tab}-${it.id}`}
          contentContainerStyle={items.length === 0 && { flex: 1 }}
          ListEmptyComponent={<EmptyState label={`Tidak ada ${tab}`} />}
          renderItem={({ item }) =>
            tab === 'produk' ? (
              <ProdukRow item={item as ProdukItem} />
            ) : (
              <SupplierRow item={item as SupplierItem} />
            )
          }
        />
      )}
    </View>
  );
}

function ProdukRow({ item }: { item: ProdukItem }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.nama ?? '-'}</Text>
        <Text style={styles.meta}>
          {item.barcode ?? '-'} • stok {item.stok ?? '0'}
        </Text>
      </View>
      <Text style={styles.price}>{formatRupiah(item.hargaJual ?? 0)}</Text>
    </View>
  );
}

function SupplierRow({ item }: { item: SupplierItem }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.nama ?? '-'}</Text>
        {!!item.alamat && <Text style={styles.meta}>{item.alamat}</Text>}
      </View>
      {!!item.telepon && <Text style={styles.meta}>☎ {item.telepon}</Text>}
    </View>
  );
}

function Seg({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.seg, active && styles.segActive]}
      onPress={onPress}
    >
      <Text style={[styles.segText, active && styles.segTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  segment: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    padding: 4,
  },
  seg: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  segActive: { backgroundColor: colors.primary },
  segText: { color: colors.muted, fontWeight: '700' },
  segTextActive: { color: '#fff' },
  searchWrap: { paddingHorizontal: 12, paddingBottom: 8 },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  price: { fontWeight: '700', color: colors.primaryDark, marginLeft: 8 },
});
