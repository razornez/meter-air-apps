import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import FloatingTabBar, { TAB_BAR_SPACE } from '../components/ui/FloatingTabBar';
import AppHeader from '../components/ui/AppHeader';
import { useTheme } from '../ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import CustomersListScreen from '../screens/CustomersListScreen';
import FakturListScreen from '../screens/FakturListScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MapScreen from '../screens/MapScreen';

const Tab = createBottomTabNavigator();

const asScreen = (c: unknown) => c as React.ComponentType<object>;

export default function MainTabs() {
  const t = useTheme();
  const { t: tr } = useTranslation();
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
        options={{ headerShown: false, title: tr('nav_home'), tabBarLabel: tr('nav_home') }}
      />
      <Tab.Screen
        name="CustomersList"
        component={asScreen(CustomersListScreen)}
        options={{ title: tr('nav_customers'), tabBarLabel: tr('nav_customers') }}
      />
      <Tab.Screen
        name="FakturList"
        component={asScreen(FakturListScreen)}
        options={{ title: tr('nav_invoices'), tabBarLabel: tr('nav_invoices') }}
      />
      <Tab.Screen
        name="Reports"
        component={asScreen(ReportsScreen)}
        options={{ title: tr('nav_reports'), tabBarLabel: tr('nav_reports') }}
      />
      <Tab.Screen
        name="Map"
        component={asScreen(MapScreen)}
        options={{ title: tr('nav_map'), tabBarLabel: tr('nav_map') }}
      />
    </Tab.Navigator>
  );
}
