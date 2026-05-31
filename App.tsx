import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import AnimatedSplash from './src/components/AnimatedSplash';
import { useThemeStore } from './src/store/useThemeStore';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const loadTheme = useThemeStore((s) => s.load);

  useEffect(() => {
    async function prepare() {
      await Promise.all([
        loadTheme(),
        new Promise(resolve => setTimeout(resolve, 1500)),
      ]);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      {showAnimatedSplash && (
        <AnimatedSplash onFinish={() => setShowAnimatedSplash(false)} />
      )}
    </SafeAreaProvider>
  );
}
