import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { OfflineProvider } from './src/offline/OfflineContext';
import { ThemeProvider, useTheme } from './src/ThemeContext';
import { RootStackParamList } from './src/navigation/types';
import MainTabs from './src/navigation/MainTabs';
import LoginScreen from './src/screens/LoginScreen';
import ScanScreen from './src/screens/ScanScreen';
import ReadingScreen from './src/screens/ReadingScreen';
import CustomerDetailScreen from './src/screens/CustomerDetailScreen';
import FakturDetailScreen from './src/screens/FakturDetailScreen';
import MasterDataScreen from './src/screens/MasterDataScreen';
import SetLocationScreen from './src/screens/SetLocationScreen';
import AnomalyScreen from './src/screens/AnomalyScreen';
import WorklistScreen from './src/screens/WorklistScreen';
import TunggakanScreen from './src/screens/TunggakanScreen';
import KinerjaScreen from './src/screens/KinerjaScreen';
import { fonts, gradients } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Splash() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.primaryDark }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

function RootNavigator() {
  const { user, initializing } = useAuth();
  const t = useTheme();
  if (initializing) return <Splash />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.primaryDark },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: fonts.displayBold },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan QR Meter' }} />
          <Stack.Screen name="Reading" component={ReadingScreen} options={{ title: 'Input Meter' }} />
          <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Detail Pelanggan' }} />
          <Stack.Screen name="FakturDetail" component={FakturDetailScreen} options={{ title: 'Detail Tagihan' }} />
          <Stack.Screen name="MasterData" component={MasterDataScreen} options={{ title: 'Master Data' }} />
          <Stack.Screen name="SetLocation" component={SetLocationScreen} options={{ title: 'Atur Lokasi' }} />
          <Stack.Screen name="Anomaly" component={AnomalyScreen} options={{ title: 'Anomali Konsumsi' }} />
          <Stack.Screen name="Worklist" component={WorklistScreen} options={{ title: 'Worklist Pencatatan' }} />
          <Stack.Screen name="Tunggakan" component={TunggakanScreen} options={{ title: 'Tunggakan & Denda' }} />
          <Stack.Screen name="Kinerja" component={KinerjaScreen} options={{ title: 'Rekap Kinerja' }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

function AppCanvas({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient
        colors={(t.isDark ? gradients.canvasDark : gradients.canvas) as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* soft pastel blobs (ref 2) — very subtle */}
      <View
        pointerEvents="none"
        style={[styles.blob, { top: -70, right: -50, backgroundColor: t.isDark ? 'rgba(52,186,203,0.10)' : 'rgba(108,200,235,0.18)' }]}
      />
      <View
        pointerEvents="none"
        style={[styles.blob, { bottom: 90, left: -70, width: 280, height: 280, backgroundColor: t.isDark ? 'rgba(122,108,240,0.08)' : 'rgba(190,180,250,0.16)' }]}
      />
      {children}
    </View>
  );
}

function ThemedApp() {
  const t = useTheme();
  const base = t.isDark ? DarkTheme : DefaultTheme;
  const navTheme: NavTheme = {
    ...base,
    colors: { ...base.colors, background: 'transparent', card: t.primaryDark, text: '#fff', primary: t.accent, border: t.border },
  };
  return (
    <AppCanvas>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AppCanvas>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', width: 240, height: 240, borderRadius: 140 },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <OfflineProvider>{fontsLoaded ? <ThemedApp /> : <Splash />}</OfflineProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
