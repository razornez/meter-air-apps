import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { OfflineProvider } from './src/offline/OfflineContext';
import { RootStackParamList } from './src/navigation/types';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ReadingScreen from './src/screens/ReadingScreen';
import CustomersListScreen from './src/screens/CustomersListScreen';
import CustomerDetailScreen from './src/screens/CustomerDetailScreen';
import FakturListScreen from './src/screens/FakturListScreen';
import FakturDetailScreen from './src/screens/FakturDetailScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import MasterDataScreen from './src/screens/MasterDataScreen';
import MapScreen from './src/screens/MapScreen';
import SetLocationScreen from './src/screens/SetLocationScreen';
import AnomalyScreen from './src/screens/AnomalyScreen';
import WorklistScreen from './src/screens/WorklistScreen';
import TunggakanScreen from './src/screens/TunggakanScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Meter Air' }}
          />
          <Stack.Screen
            name="Scan"
            component={ScanScreen}
            options={{ title: 'Scan QR Meter' }}
          />
          <Stack.Screen
            name="Reading"
            component={ReadingScreen}
            options={{ title: 'Input Meter' }}
          />
          <Stack.Screen
            name="CustomersList"
            component={CustomersListScreen}
            options={{ title: 'Pelanggan' }}
          />
          <Stack.Screen
            name="CustomerDetail"
            component={CustomerDetailScreen}
            options={{ title: 'Detail Pelanggan' }}
          />
          <Stack.Screen
            name="FakturList"
            component={FakturListScreen}
            options={{ title: 'Tagihan' }}
          />
          <Stack.Screen
            name="FakturDetail"
            component={FakturDetailScreen}
            options={{ title: 'Detail Tagihan' }}
          />
          <Stack.Screen
            name="Reports"
            component={ReportsScreen}
            options={{ title: 'Laporan' }}
          />
          <Stack.Screen
            name="MasterData"
            component={MasterDataScreen}
            options={{ title: 'Master Data' }}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{ title: 'Peta Konsumen' }}
          />
          <Stack.Screen
            name="SetLocation"
            component={SetLocationScreen}
            options={{ title: 'Atur Lokasi' }}
          />
          <Stack.Screen
            name="Anomaly"
            component={AnomalyScreen}
            options={{ title: 'Anomali Konsumsi' }}
          />
          <Stack.Screen
            name="Worklist"
            component={WorklistScreen}
            options={{ title: 'Worklist Pencatatan' }}
          />
          <Stack.Screen
            name="Tunggakan"
            component={TunggakanScreen}
            options={{ title: 'Tunggakan & Denda' }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OfflineProvider>
          <StatusBar style="light" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </OfflineProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
