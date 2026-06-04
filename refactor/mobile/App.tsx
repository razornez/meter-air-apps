import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
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
import AppHeader from './src/components/ui/AppHeader';
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
import FakturListScreen from './src/screens/FakturListScreen';
import CustomersListScreen from './src/screens/CustomersListScreen';
import PaymentWebViewScreen from './src/screens/PaymentWebViewScreen';
import CustomerCardScreen from './src/screens/CustomerCardScreen';
import PaymentSelectScreen from './src/screens/PaymentSelectScreen';
import CashPaymentScreen from './src/screens/CashPaymentScreen';
import AccountPaymentScreen from './src/screens/AccountPaymentScreen';

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
        header: (props) => <AppHeader {...props} />,
        contentStyle: { backgroundColor: t.bg },
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
          {/* Layar yang bisa diakses dari mana saja (termasuk dari Tunggakan, Anomali dll) */}
          <Stack.Screen name="FakturList" component={FakturListScreen} options={{ title: 'Tagihan' }} />
          <Stack.Screen name="CustomersList" component={CustomersListScreen} options={{ title: 'Pelanggan' }} />
          <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} options={{ title: 'Pembayaran' }} />
          <Stack.Screen name="CustomerCard" component={CustomerCardScreen} options={{ title: 'Kartu Pelanggan' }} />
          <Stack.Screen name="PaymentSelect" component={PaymentSelectScreen} options={{ title: 'Pilih Metode Bayar' }} />
          <Stack.Screen name="CashPayment" component={CashPaymentScreen} options={{ title: 'Pembayaran Tunai' }} />
          <Stack.Screen name="AccountPayment" component={AccountPaymentScreen} options={({ route }) => ({ title: route.params.method.name })} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

function ThemedApp() {
  const t = useTheme();
  const base = t.isDark ? DarkTheme : DefaultTheme;
  const navTheme: NavTheme = {
    ...base,
    colors: { ...base.colors, background: t.bg, card: t.surface, text: t.text, primary: t.primary, border: t.border },
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </KeyboardAvoidingView>
  );
}

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
