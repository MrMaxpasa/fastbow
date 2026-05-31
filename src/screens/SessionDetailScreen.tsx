// src/screens/SessionDetailScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Session } from '../types';
import { SCORE_COLORS, roundLabel, arrowToPoints, scoreTextColor, scoreBgColor, scoreBorderColor } from '../types';
import type { ArrowScore } from '../types';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useThemeStore } from '../store/useThemeStore';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

const styles = StyleSheet.create({
  scoreBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
});

function ScoreBadge({ score }: { score: ArrowScore }) {
  return (
    <View
      style={[
        styles.scoreBadge,
        {
          backgroundColor: scoreBgColor(score),
          borderColor: scoreBorderColor(score),
        },
      ]}
    >
      <Text style={[styles.scoreBadgeText, { color: scoreTextColor(score) }]}>
        {score}
      </Text>
    </View>
  );
}

export default function SessionDetailScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const { getSession, deleteSession } = useAppStore();
  const session = getSession(sessionId);
  const theme = useThemeStore((s) => s.theme);
  const st = makeStyles(theme);

  if (!session) {
    return (
      <View style={[st.centered, { backgroundColor: theme.bg }]}>
        <Text style={st.errorText}>Sesión no encontrada</Text>
      </View>
    );
  }

  const percentage = Math.round((session.grandTotal / session.maxPossible) * 100);

  function handleDelete() {
    Alert.alert(
      'Eliminar sesión',
      '¿Seguro que quieres eliminar esta sesión? No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteSession(sessionId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={st.content}>
      {/* Cabecera */}
      <View style={st.header}>
        <View>
          <Text style={st.archerName}>{session.archerName}</Text>
          <Text style={st.meta}>
            {roundLabel(session.roundType)} · {format(session.date, "d MMMM yyyy", { locale: es })}
          </Text>
        </View>
        <View style={st.totalBox}>
          <Text style={st.totalScore}>{session.grandTotal}</Text>
          <Text style={st.totalMax}>/ {session.maxPossible}</Text>
          <Text style={st.totalPct}>{percentage}%</Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={st.progressBg}>
        <View style={[st.progressFill, { width: `${percentage}%` }]} />
      </View>

      {/* Tabla de series */}
      <Text style={st.sectionTitle}>Fichas por serie</Text>

      <View style={st.tableHeader}>
        <Text style={[st.tableHeaderCell, st.cellEnd]}>Serie</Text>
        <Text style={[st.tableHeaderCell, st.cellArrows]}>Flechas</Text>
        <Text style={[st.tableHeaderCell, st.cellTotal]}>Total</Text>
        <Text style={[st.tableHeaderCell, st.cellRunning]}>Acum.</Text>
      </View>

      {session.ends.length === 0 && (
        <Text style={st.emptyText}>Aún no hay series registradas</Text>
      )}

      {(() => {
        let running = 0;
        return session.ends.map((end) => {
          running += end.total;
          return (
            <View key={end.id} style={st.tableRow}>
              <Text style={[st.tableCell, st.cellEnd]}>{end.endNumber}</Text>
              <View style={[st.tableCellView, st.cellArrows]}>
                <View style={st.arrowsContainer}>
                  {end.arrows.map((a, i) => (
                    <ScoreBadge key={i} score={a} />
                  ))}
                </View>
              </View>
              <Text style={[st.tableCell, st.cellTotal, st.cellTotalText]}>
                {end.total}
              </Text>
              <Text style={[st.tableCell, st.cellRunning]}>{running}</Text>
            </View>
          );
        });
      })()}

      {/* Distribución */}
      {session.ends.length > 0 && (
        <>
          <Text style={[st.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>
            Distribución de puntuaciones
          </Text>
          <ScoreDistribution session={session} />
        </>
      )}

      {/* Acciones */}
      <View style={st.actions}>
        <Pressable
          style={st.deleteButton}
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Eliminar sesión"
        >
          <Text style={st.deleteButtonText}>Borrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 20;

function AnimatedScoreBar({
  score,
  count,
  maxCount,
  delay,
}: {
  score: ArrowScore;
  count: number;
  maxCount: number;
  delay: number;
}) {
  const theme = useThemeStore((s) => s.theme);
  const anim = useRef(new Animated.Value(0)).current;
  const BAR_MAX = SCREEN_WIDTH - CARD_PADDING * 2 - 100;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: (count / maxCount) * BAR_MAX,
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, [count, maxCount]);

  return (
    <View style={distStyles.row}>
      <View style={[
        distStyles.badge,
        {
          backgroundColor: scoreBgColor(score),
          borderColor: scoreBorderColor(score),
        },
      ]}>
        <Text style={[distStyles.badgeText, { color: scoreTextColor(score) }]}>
          {score}
        </Text>
      </View>
      <View style={[distStyles.barBg, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[
            distStyles.barFill,
            { width: anim, backgroundColor: scoreBorderColor(score) },
          ]}
        />
      </View>
      <Text style={[distStyles.count, { color: theme.textSecondary }]}>{count}</Text>
    </View>
  );
}

function ScoreDistribution({ session }: { session: Session }) {
  const theme = useThemeStore((s) => s.theme);
  const scoreOrder: ArrowScore[] = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'];
  const allArrows = session.ends.flatMap((e) => e.arrows);
  const counts: Partial<Record<ArrowScore, number>> = {};
  for (const a of allArrows) counts[a] = (counts[a] ?? 0) + 1;

  const entries = scoreOrder
    .filter((s) => (counts[s] ?? 0) > 0)
    .map((s) => [s, counts[s] ?? 0] as [ArrowScore, number]);

  const maxCount = Math.max(...entries.map(([, c]) => c));

  return (
    <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      {entries.map(([score, count], i) => (
        <AnimatedScoreBar
          key={score}
          score={score}
          count={count}
          maxCount={maxCount}
          delay={i * 50}
        />
      ))}
    </View>
  );
}

const distStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  badge: {
    width: 32,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  barBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  count: {
    width: 28,
    fontSize: 12,
    textAlign: 'right',
  },
});

function makeStyles(t: Theme) {
  return StyleSheet.create({
    content: { padding: 20, paddingBottom: 60 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: t.textMuted, fontSize: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    archerName: { fontSize: 22, fontWeight: '800', color: t.textPrimary },
    meta: { fontSize: 13, color: t.textSecondary, marginTop: 4 },
    totalBox: { alignItems: 'flex-end' },
    totalScore: { fontSize: 36, fontWeight: '900', color: t.accent },
    totalMax: { fontSize: 13, color: t.textMuted },
    totalPct: { fontSize: 14, fontWeight: '700', color: t.accent },
    progressBg: { height: 6, backgroundColor: t.border, borderRadius: 3, marginBottom: 24 },
    progressFill: { height: 6, backgroundColor: t.accent, borderRadius: 3 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    tableHeader: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 6 },
    tableHeaderCell: { fontSize: 11, fontWeight: '700', color: t.textMuted, textTransform: 'uppercase' },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.bgCard,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 4,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: t.border,
    },
    tableCell: { fontSize: 14, color: t.textSecondary, textAlign: 'center' },
    tableCellView: { justifyContent: 'center' },
    cellEnd: { width: 40, textAlign: 'center' },
    cellArrows: { flex: 1 },
    cellTotal: { width: 44, textAlign: 'center' },
    cellTotalText: { fontWeight: '700', color: t.accent },
    cellRunning: { width: 50, textAlign: 'center', color: t.textMuted },
    arrowsContainer: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
    emptyText: { color: t.textMuted, textAlign: 'center', padding: 20 },
    actions: { marginTop: 32 },
    deleteButton: {
      borderWidth: 1,
      borderColor: t.danger,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    deleteButtonText: { color: t.danger, fontWeight: '600', fontSize: 15 },
  });
}
