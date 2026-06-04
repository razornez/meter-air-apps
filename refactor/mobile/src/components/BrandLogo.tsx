import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface Props {
  logoBg: string;
  logoText: string;
  logoUrl?: string | null;
  size?: number;
  radius?: number;
}

/**
 * Ikon brand payment method.
 * Coba load gambar dari logoUrl (logo asli); fallback ke kotak berwarna + teks bila gagal.
 */
export function BrandLogo({ logoBg, logoText, logoUrl, size = 48, radius = 12 }: Props) {
  const [imgError, setImgError] = useState(false);

  const fontSize = size < 40 ? 9 : size < 50 ? 11 : 13;
  const box = { width: size, height: size, borderRadius: radius };

  if (logoUrl && !imgError) {
    return (
      <View style={[styles.wrap, { backgroundColor: '#fff', ...box, borderWidth: 1, borderColor: '#E8EEF4' }]}>
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size * 0.7, height: size * 0.7 }}
          resizeMode="contain"
          onError={() => setImgError(true)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: logoBg, ...box }]}>
      <Text style={[styles.text, { fontSize, color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>
        {logoText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  text: { fontWeight: '900', letterSpacing: 0.5 },
});
