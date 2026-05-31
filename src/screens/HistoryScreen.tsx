// src/screens/HistoryScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList, Session } from '../types';
import { roundLabel } from '../types';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import type { Theme } from '../theme';

type Props = BottomTabScreenProps<TabParamList, 'History'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

function SessionRow({ session }: { session: Session }) {
  const navigation = useNavigation<NavProp>();
  const theme = useThemeStore((s) => s.theme);
  const st = makeStyles(theme);
  const pct = Math.round((session.grandTotal / session.maxPossible) * 100);

  return (
    <Pressable
      style={st.row}
      onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
      accessibilityRole="button"
      accessibilityLabel={`Sesión de ${session.archerName}, ${session.grandTotal} puntos`}
    >
      <View style={st.rowLeft}>
        <Text style={st.rowDate}>
          {format(session.date, "d MMM yy", { locale: es })}
        </Text>
        <Text style={st.rowRound}>{roundLabel(session.roundType)}</Text>
        <Text style={st.rowArcher}>{session.archerName}</Text>
      </View>
      <View style={st.rowRight}>
        <Text style={st.rowScore}>{session.grandTotal}</Text>
        <Text style={st.rowMax}>/ {session.maxPossible}</Text>
        <View style={st.pctBadge}>
          <Text style={st.pctText}>{pct}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen(_: Props) {
  const { sessions } = useAppStore();
  const theme = useThemeStore((s) => s.theme);
  const st = makeStyles(theme);

  if (sessions.length === 0) {
    return (
      <View style={[st.empty, { backgroundColor: theme.bg }]}>
        <Text style={st.emptyTitle}>Sin historial todavía</Text>
        <Text style={st.emptyText}>
          Tus sesiones de tiro aparecerán aquí una vez las registres.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={sessions}
      renderItem={({ item }) => <SessionRow session={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, backgroundColor: theme.bg }}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      style={{ backgroundColor: theme.bg }}
    />
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    list: { padding: 16 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: t.bgCard,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    rowLeft: { flex: 1 },
    rowDate: { fontSize: 12, color: t.textMuted },
    rowRound: { fontSize: 15, fontWeight: '700', color: t.textPrimary, marginTop: 2 },
    rowArcher: { fontSize: 13, color: t.textSecondary, marginTop: 1 },
    rowRight: { alignItems: 'flex-end' },
    rowScore: { fontSize: 28, fontWeight: '900', color: t.accent },
    rowMax: { fontSize: 12, color: t.textMuted },
    pctBadge: {
      backgroundColor: t.accentSoft,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginTop: 2,
    },
    pctText: { fontSize: 12, fontWeight: '700', color: t.accent },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: t.textPrimary, marginTop: 16 },
    emptyText: { fontSize: 14, color: t.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  });
}
