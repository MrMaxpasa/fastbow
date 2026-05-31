// src/navigation/RootNavigator.tsx
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList, TabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import VSScreen from '../screens/VSScreen';
import CameraScreen from '../screens/CameraScreen';
import ScoreReviewScreen from '../screens/ScoreReviewScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import NewSessionScreen from '../screens/NewSessionScreen';
import RankInfoScreen from '../screens/RankInfoScreen';
import { useThemeStore } from '../store/useThemeStore';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

          const icons: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
            Home:     { active: 'home',      inactive: 'home-outline' },
            Stats:    { active: 'bar-chart', inactive: 'bar-chart-outline' },
            VS:       { active: 'flash',     inactive: 'flash-outline' },
            History:  { active: 'list',      inactive: 'list-outline' },
            Settings: { active: 'settings',  inactive: 'settings-outline' },
          };

          if (route.name === 'VS') {
            return (
              <View style={{
                backgroundColor: focused ? theme.accent : theme.accentSoft,
                borderRadius: 12,
                width: 40,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 2,
              }}>
                <Ionicons
                  name={focused ? 'flash' : 'flash-outline'}
                  size={20}
                  color={focused ? '#ffffff' : theme.accent}
                />
              </View>
            );
          }

          const icon = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={22}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 22,
          paddingTop: 6,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ title: 'Inicio' }} />
      <Tab.Screen name="Stats"    component={StatsScreen}    options={{ title: 'Estadística' }} />
      <Tab.Screen name="VS"       component={VSScreen}       options={{ title: 'VS' }} />
      <Tab.Screen name="History"  component={HistoryScreen}  options={{ title: 'Historial' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="NewSession" component={NewSessionScreen} options={{ title: 'Nueva sesión' }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Fotografiar diana', headerShown: false }} />
        <Stack.Screen name="ScoreReview" component={ScoreReviewScreen} options={{ title: 'Revisar puntuación' }} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Detalle sesión' }} />
        <Stack.Screen
          name="RankInfo"
          component={RankInfoScreen}
          options={{
            title: 'Sistema de rangos',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
