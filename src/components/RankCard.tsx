import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeStore } from '../store/useThemeStore';
import { RankResult } from '../types/ranks';
import type { RootStackParamList } from '../types';
import RankEmblem from './RankEmblem';

interface Props {
  result: RankResult;
  compact?: boolean;
}

export default function RankCard({ result, compact = false }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: result.progressToNext,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [result.progressToNext]);

  if (compact) {
    return (
      <View style={[styles.compactCard, { backgroundColor: theme.bgCard, borderColor: result.rank.color + '55' }]}>
        <RankEmblem rankId={result.rank.id} color={result.rank.color} size={36} />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: result.rank.color }]}>
            {result.rank.name}
          </Text>
          {result.isProvisional && (
            <Text style={[styles.provisional, { color: theme.textMuted }]}>Provisional</Text>
          )}
        </View>
        <Text style={[styles.compactScore, { color: theme.textSecondary }]}>
          {result.score}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => navigation.navigate('RankInfo')}
      accessibilityRole="button"
      accessibilityLabel="Ver sistema de rangos"
    >
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: result.rank.color + '55' }]}>
        <View style={styles.header}>
          <RankEmblem rankId={result.rank.id} color={result.rank.color} size={72} />
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.rankName, { color: result.rank.color }]}>
                {result.rank.name}
              </Text>
              {result.isProvisional && (
                <View style={[styles.provisionalBadge, { borderColor: theme.border }]}>
                  <Text style={[styles.provisionalText, { color: theme.textMuted }]}>
                    Provisional
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.rankScore, { color: theme.textPrimary }]}>
              Puntuación: <Text style={{ color: result.rank.color, fontWeight: '900' }}>{result.score}</Text>
            </Text>
            <Text style={[styles.sessions, { color: theme.textMuted }]}>
              {result.sessionCount} {result.sessionCount === 1 ? 'sesión' : 'sesiones'} completadas
              {result.isProvisional && ` · faltan ${10 - result.sessionCount} para rango definitivo`}
            </Text>
          </View>
        </View>

        <View style={[styles.breakdown, { borderTopColor: theme.border }]}>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownValue, { color: theme.textPrimary }]}>{result.weightedAvg}%</Text>
            <Text style={[styles.breakdownLabel, { color: theme.textMuted }]}>Media reciente</Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: theme.border }]} />
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownValue, { color: theme.textPrimary }]}>{result.consistency}%</Text>
            <Text style={[styles.breakdownLabel, { color: theme.textMuted }]}>Consistencia</Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: theme.border }]} />
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownValue, { color: theme.textPrimary }]}>{result.bestMark}%</Text>
            <Text style={[styles.breakdownLabel, { color: theme.textMuted }]}>Mejor marca</Text>
          </View>
        </View>

        {result.nextRank && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressCurrent, { color: result.rank.color }]}>
                {result.rank.name}
              </Text>
              <Text style={[styles.progressNext, { color: result.nextRank.color }]}>
                {result.nextRank.name} →
              </Text>
            </View>
            <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: result.rank.color,
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPct, { color: theme.textSecondary }]}>
              {result.progressToNext}% completado
            </Text>
          </View>
        )}

        {result.rank.id === 8 && (
          <View style={[styles.maxRank, { borderTopColor: theme.border }]}>
            <Text style={[styles.maxRankText, { color: result.rank.color }]}>
              Rango máximo alcanzado
            </Text>
          </View>
        )}

        <View style={[styles.tapHint, { borderTopColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.tapHintText, { color: theme.textMuted }]}>
            Pulsa para ver todos los rangos
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1.5, padding: 20 },
  compactCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  compactInfo: { flex: 1 },
  compactName: { fontSize: 14, fontWeight: '700' },
  compactScore: { fontSize: 13, fontWeight: '600' },
  provisional: { fontSize: 11, marginTop: 2 },
  header: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rankName: { fontSize: 20, fontWeight: '900' },
  provisionalBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  provisionalText: { fontSize: 10, fontWeight: '600' },
  rankScore: { fontSize: 14, marginTop: 6 },
  sessions: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  breakdown: { flexDirection: 'row', marginTop: 20, paddingTop: 16, borderTopWidth: 1 },
  breakdownItem: { flex: 1, alignItems: 'center' },
  breakdownValue: { fontSize: 18, fontWeight: '800' },
  breakdownLabel: { fontSize: 10, marginTop: 3, textAlign: 'center' },
  breakdownDivider: { width: 1, marginHorizontal: 8 },
  progressSection: { marginTop: 20 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressCurrent: { fontSize: 12, fontWeight: '700' },
  progressNext: { fontSize: 12, fontWeight: '700' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressPct: { fontSize: 11, marginTop: 6, textAlign: 'right' },
  maxRank: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, alignItems: 'center' },
  maxRankText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tapHintText: { fontSize: 12 },
});
