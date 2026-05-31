export interface Theme {
  bg: string;
  bgCard: string;
  bgInput: string;
  border: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  success: string;
  tabBar: string;
  tabBarBorder: string;
}

export const darkTheme: Theme = {
  bg: '#0f0f14',
  bgCard: '#1a1a24',
  bgInput: '#1a1a24',
  border: '#2a2a38',
  accent: '#7c6ef5',
  accentSoft: '#7c6ef520',
  textPrimary: '#f0f0f5',
  textSecondary: '#a0a0b0',
  textMuted: '#606070',
  danger: '#e05555',
  success: '#4caf7d',
  tabBar: '#0f0f14',
  tabBarBorder: '#2a2a38',
};

export const lightTheme: Theme = {
  bg: '#f5f5fa',
  bgCard: '#ffffff',
  bgInput: '#ffffff',
  border: '#e0e0ea',
  accent: '#6355e0',
  accentSoft: '#6355e015',
  textPrimary: '#1a1a2e',
  textSecondary: '#5a5a70',
  textMuted: '#a0a0b0',
  danger: '#d04040',
  success: '#3a9e6a',
  tabBar: '#ffffff',
  tabBarBorder: '#e0e0ea',
};

export const SCORE_COLORS: Record<string, string> = {
  X: '#f5c842',
  '10': '#f5c842',
  '9': '#f5c842',
  '8': '#e06060',
  '7': '#e06060',
  '6': '#5b9cf5',
  '5': '#5b9cf5',
  '4': '#5b9cf5',
  '3': '#888899',
  '2': '#888899',
  '1': '#888899',
  M: '#444455',
};
