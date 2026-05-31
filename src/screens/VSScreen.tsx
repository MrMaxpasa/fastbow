// src/screens/VSScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export default function VSScreen() {
  const theme = useThemeStore((s) => s.theme);
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.accent }]}>VS</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>Reta a un amigo. Próximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 48, fontWeight: '900', letterSpacing: 4 },
  sub: { fontSize: 15, marginTop: 8 },
});
