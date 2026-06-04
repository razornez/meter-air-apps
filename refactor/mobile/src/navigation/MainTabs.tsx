import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FloatingTabBar, { TAB_BAR_SPACE } from '../components/ui/FloatingTabBar';
import AppHeader from '../components/ui/AppHeader';
import { useTheme } from '../ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import CustomersListScreen from '../screens/CustomersListScreen';
import FakturListScreen from '../screens/FakturListScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MapScreen from '../screens/MapScreen';

const Tab = createBottomTabNavigator();

// Screens were originally typed for the native stack; in the tab navigator their
// navigation object still bubbles to the parent stack at runtime.
const asScreen = (c: unknown) => c as React.ComponentType<object>;

/**
 * Primary navigation: a floating glass tab bar over the 5 core sections.
 * Detail/secondary screens stay in the parent stack (see App.tsx).
 */
export default function MainTabs() {
  const t = useTheme();
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        header: (props) => <AppHeader {...props} />,
        sceneStyle: { backgroundColor: t.bg, paddingBottom: TAB_BAR_SPACE },
      }}
    >
      <Tab.Screen
        name="Home"
        component={asScreen(HomeScreen)}
        options={{ headerShown: false, title: 'Beranda', tabBarLabel: 'Beranda' }}
      />
      <Tab.Screen
        name="CustomersList"
        component={asScreen(CustomersListScreen)}
        options={{ title: 'Pelanggan', tabBarLabel: 'Pelanggan' }}
      />
      <Tab.Screen
        name="FakturList"
        component={asScreen(FakturListScreen)}
        options={{ title: 'Tagihan', tabBarLabel: 'Tagihan' }}
      />
      <Tab.Screen
        name="Reports"
        component={asScreen(ReportsScreen)}
        options={{ title: 'Laporan', tabBarLabel: 'Laporan' }}
      />
      <Tab.Screen
        name="Map"
        component={asScreen(MapScreen)}
        options={{ title: 'Peta', tabBarLabel: 'Peta' }}
      />
    </Tab.Navigator>
  );
}
