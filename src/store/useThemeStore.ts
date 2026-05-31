import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, type Theme } from '../theme';

interface ThemeState {
  isDark: boolean;
  theme: Theme;
  toggle: () => void;
  load: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,
  theme: darkTheme,
  load: async () => {
    const saved = await AsyncStorage.getItem('theme_mode');
    const isDark = saved !== 'light';
    set({ isDark, theme: isDark ? darkTheme : lightTheme });
  },
  toggle: () => {
    const isDark = !get().isDark;
    set({ isDark, theme: isDark ? darkTheme : lightTheme });
    AsyncStorage.setItem('theme_mode', isDark ? 'dark' : 'light');
  },
}));
