// src/screens/RankInfoScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/useThemeStore';
import { useAppStore } from '../store/useAppStore';
import { RANKS, computeRank } from '../types/ranks';
import RankEmblem from '../components/RankEmblem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Fila animada de rango ────────────────────────────────────────
function RankRow({
  rank,
  isCurrent,
  isReached,
  delay,
  progressToNext,
}: {
  rank: typeof RANKS[0];
  isCurrent: boolean;
  isReached: boolean;
  delay: number;
  progressToNext?: number;
}) {
  const theme = useThemeStore((s) => s.theme);
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    if (isCurrent && progressToNext !== undefined) {
      Animated.timing(progressAnim, {
        toValue: progressToNext,
        duration: 800,
        delay: delay + 400,
        useNativeDriver: false,
      }).start();
    } else if (isReached) {
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 600,
        delay: delay + 200,
        useNativeDriver: false,
      }).start();
    }
  }, []);

  const cardBg = isCurrent ? rank.color + '18' : theme.bgCard;
  const borderColor = isCurrent ? rank.color : isReached ? rank.color + '55' : theme.border;

  return (
    <Animated.View
      style={[
        styles.rankRow,
        {
          backgroundColor: cardBg,
          borderColor,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.emblemWrapper, { opacity: isReached || isCurrent ? 1 : 0.35 }]}>
        <RankEmblem
          rankId={rank.id}
          color={isReached || isCurrent ? rank.color : theme.textMuted}
          size={52}
        />
        {isCurrent && (
          <View style={[styles.currentDot, { backgroundColor: rank.color }]} />
        )}
      </View>

      <View style={[styles.rankInfo, { opacity: isReached || isCurrent ? 1 : 0.35 }]}>
        <View style={styles.rankNameRow}>
          <Text style={[
            styles.rankName,
            { color: isCurrent ? rank.color : isReached ? theme.textPrimary : theme.textMuted },
          ]}>
            {rank.name}
          </Text>
          {isCurrent && (
            <View style={[styles.currentBadge, { backgroundColor: rank.color }]}>
              <Text style={styles.currentBadgeText}>TU RANGO</Text>
            </View>
          )}
          {isReached && !isCurrent && (
            <View style={[styles.reachedBadge, { borderColor: rank.color + '55' }]}>
              <Text style={[styles.reachedBadgeText, { color: rank.color }]}>✓</Text>
            </View>
          )}
        </View>

        <Text style={[styles.rankThreshold, { color: theme.textMuted }]}>
          Puntuación mínima: {rank.minScore}
        </Text>

        {isCurrent && progressToNext !== undefined && (
          <View style={styles.progressWrapper}>
            <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: rank.color,
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPct, { color: rank.color }]}>
              {progressToNext}%
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Sección de cómo se calcula ──────────────────────────────────
function HowItWorks() {
  const theme = useThemeStore((s) => s.theme);

  const factors = [
    {
      pct: '50%',
      title: 'Media ponderada reciente',
      desc: 'Las últimas 10 sesiones, donde las más recientes tienen más peso. Premia la mejora continua.',
      color: '#7c6ef5',
    },
    {
      pct: '30%',
      title: 'Consistencia',
      desc: 'Cuánto varías entre sesiones. Un tirador regular sube más que uno irregular aunque tenga días buenos.',
      color: '#4caf7d',
    },
    {
      pct: '20%',
      title: 'Mejor marca',
      desc: 'Tu pico histórico. Sirve para desempatar entre arqueros con media similar.',
      color: '#f5c842',
    },
  ];

  return (
    <View style={[styles.howCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <Text style={[styles.howTitle, { color: theme.textPrimary }]}>
        ¿Cómo se calcula tu rango?
      </Text>
      <Text style={[styles.howSub, { color: theme.textSecondary }]}>
        Tu puntuación combina tres factores con pesos distintos:
      </Text>

      {factors.map((f, i) => (
        <View key={i} style={[styles.factorRow, { borderTopColor: theme.border }]}>
          <View style={[styles.factorPct, { backgroundColor: f.color + '22', borderColor: f.color + '55' }]}>
            <Text style={[styles.factorPctText, { color: f.color }]}>{f.pct}</Text>
          </View>
          <View style={styles.factorInfo}>
            <Text style={[styles.factorTitle, { color: theme.textPrimary }]}>{f.title}</Text>
            <Text style={[styles.factorDesc, { color: theme.textSecondary }]}>{f.desc}</Text>
          </View>
        </View>
      ))}

      <View style={[styles.noteBox, { backgroundColor: theme.border + '55' }]}>
        <Text style={[styles.noteText, { color: theme.textSecondary }]}>
          Con menos de 10 sesiones el rango es provisional. A partir de la décima sesión se vuelve definitivo.
        </Text>
      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────
export default function RankInfoScreen() {
  const theme = useThemeStore((s) => s.theme);
  const { sessions } = useAppStore();
  const insets = useSafeAreaInsets();

  const finished = sessions.filter((s) => s.ends.length >= s.totalEnds);
  const rankResult = computeRank(finished);
  const currentRankId = finished.length > 0 ? rankResult.rank.id : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
    >
      <View style={styles.headerSection}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Sistema de rangos
        </Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
          8 rangos basados en tu rendimiento real. Progresa siendo constante.
        </Text>
      </View>

      <HowItWorks />

      <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 28 }]}>
        Todos los rangos
      </Text>

      {[...RANKS].reverse().map((rank, i) => (
        <RankRow
          key={rank.id}
          rank={rank}
          isCurrent={rank.id === currentRankId}
          isReached={rank.id < currentRankId}
          delay={i * 60}
          progressToNext={rank.id === currentRankId ? rankResult.progressToNext : undefined}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  headerSection: { marginBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '900' },
  headerSub: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  howCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  howTitle: { fontSize: 17, fontWeight: '800' },
  howSub: { fontSize: 13, marginTop: 6, lineHeight: 18, marginBottom: 4 },
  factorRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    paddingTop: 14,
    marginTop: 14,
    borderTopWidth: 1,
  },
  factorPct: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 52,
    alignItems: 'center',
  },
  factorPctText: { fontSize: 15, fontWeight: '900' },
  factorInfo: { flex: 1 },
  factorTitle: { fontSize: 14, fontWeight: '700' },
  factorDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  noteBox: { borderRadius: 10, padding: 12, marginTop: 16 },
  noteText: { fontSize: 12, lineHeight: 17 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  emblemWrapper: { position: 'relative' },
  currentDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0f0f14',
  },
  rankInfo: { flex: 1 },
  rankNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rankName: { fontSize: 16, fontWeight: '800' },
  currentBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  currentBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },
  reachedBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  reachedBadgeText: { fontSize: 12, fontWeight: '700' },
  rankThreshold: { fontSize: 12, marginTop: 3 },
  progressWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressBg: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  progressPct: { fontSize: 11, fontWeight: '700', minWidth: 32, textAlign: 'right' },
});
