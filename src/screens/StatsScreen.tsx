// src/screens/StatsScreen.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useAppStore } from '../store/useAppStore';
import { SCORE_COLORS, roundLabel, arrowToPoints, scoreTextColor, scoreBgColor, scoreBorderColor } from '../types';
import { computeRank } from '../types/ranks';
import RankCard from '../components/RankCard';
import type { ArrowScore } from '../types';
import type { TendencyResult } from '../utils/targetDetection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 20;
const CHART_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2 - 48;
const CHART_HEIGHT = 160;

// ─── Mini stat card ───────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const theme = useThemeStore((s) => s.theme);
  return (
    <View style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      {sub && <Text style={[styles.statSub, { color: theme.textMuted }]}>{sub}</Text>}
    </View>
  );
}

// ─── Line chart ──────────────────────────────────────────────────
function ProgressChart({ data, accentColor }: { data: number[]; accentColor: string }) {
  if (data.length < 2) return null;

  const max = 100;
  const min = 0;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * CHART_WIDTH,
    y: CHART_HEIGHT - ((v - min) / (max - min)) * CHART_HEIGHT,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z`;

  const guides = [0, 50, 100];

  return (
    <View style={styles.chartContainer}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {guides.map((g) => {
          const y = CHART_HEIGHT - ((g - min) / (max - min)) * CHART_HEIGHT;
          return (
            <Line
              key={g}
              x1={0} y1={y} x2={CHART_WIDTH} y2={y}
              stroke="#444455"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          );
        })}
        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path
          d={linePath}
          stroke={accentColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={accentColor} />
        ))}
      </Svg>
      <View style={styles.yLabels}>
        {[...guides].reverse().map((g) => (
          <Text key={g} style={styles.yLabel}>{g}%</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Barra de distribución animada ───────────────────────────────
function ScoreBar({
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
  const BAR_MAX = SCREEN_WIDTH - CARD_PADDING * 2 - 80;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: count > 0 ? (count / maxCount) * BAR_MAX : 0,
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, [count, maxCount]);

  return (
    <View style={styles.scoreBarRow}>
      <View style={[
        styles.scoreBarBadge,
        {
          backgroundColor: scoreBgColor(score),
          borderColor: scoreBorderColor(score),
        },
      ]}>
        <Text style={[styles.scoreBarLabel, { color: scoreTextColor(score) }]}>{score}</Text>
      </View>
      <View style={[styles.scoreBarBg, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[
            styles.scoreBarFill,
            { width: anim, backgroundColor: scoreBorderColor(score) },
          ]}
        />
      </View>
      <Text style={[styles.scoreBarCount, { color: theme.textSecondary }]}>
        {count > 0 ? count : '-'}
      </Text>
    </View>
  );
}

// ─── Diana de tendencia dinámica ─────────────────────────────────
function TendencyTarget({ sessions }: { sessions: ReturnType<typeof useAppStore>['sessions'] }) {
  const theme = useThemeStore((s) => s.theme);
  const SIZE = 200;
  const CX = SIZE / 2;

  const hasRealData = true;

  const rings = [
    // Zona blanca — 1 y 2 puntos (exterior)
    { r: 97,   color: '#f0f0f0', stroke: '#bbbbbb', strokeWidth: 1.2 },
    { r: 87.3, color: '#f0f0f0', stroke: '#bbbbbb', strokeWidth: 0.8 },
    // Zona negra — 3 y 4 puntos
    { r: 77.6, color: '#1a1a1a', stroke: '#444444', strokeWidth: 0.8 },
    { r: 67.9, color: '#1a1a1a', stroke: '#444444', strokeWidth: 0.8 },
    // Zona azul — 5 y 6 puntos
    { r: 58.2, color: '#1565C0', stroke: '#0d47a1', strokeWidth: 0.8 },
    { r: 48.5, color: '#1565C0', stroke: '#0d47a1', strokeWidth: 0.8 },
    // Zona roja — 7 y 8 puntos
    { r: 38.8, color: '#C62828', stroke: '#b71c1c', strokeWidth: 0.8 },
    { r: 29.1, color: '#C62828', stroke: '#b71c1c', strokeWidth: 0.8 },
    // Zona amarilla — 9 y 10 puntos (bullseye)
    { r: 19.4, color: '#F9A825', stroke: '#f57f17', strokeWidth: 0.8 },
    { r: 9.7,  color: '#F9A825', stroke: '#f57f17', strokeWidth: 0.8 },
  ];

  // Simulación de tendencia para mostrar el diseño (solo cuando IS_MOCK activo)
  const mockTendency = { offsetX: 0.18, offsetY: -0.12 };
  const tendency = hasRealData ? null : mockTendency;

  const tendencyDotX = CX + (tendency?.offsetX ?? 0) * 90;
  const tendencyDotY = CX + (tendency?.offsetY ?? 0) * 90;

  return (
    <View style={styles.targetWrapper}>
      <Svg width={SIZE} height={SIZE}>
        {/* Anillos rellenos de exterior a interior */}
        {rings.map((r, i) => (
          <Circle
            key={i}
            cx={CX}
            cy={CX}
            r={r.r}
            fill={r.color}
            stroke={r.stroke}
            strokeWidth={r.strokeWidth}
          />
        ))}

        {/* Líneas divisorias entre los dos anillos de cada zona — mismo color pero más oscuro */}
        <Circle cx={CX} cy={CX} r={87.3} fill="none" stroke="#aaaaaa" strokeWidth={0.6} opacity={0.6} />
        <Circle cx={CX} cy={CX} r={67.9} fill="none" stroke="#222222" strokeWidth={0.6} opacity={0.8} />
        <Circle cx={CX} cy={CX} r={48.5} fill="none" stroke="#0a3d8f" strokeWidth={0.6} opacity={0.8} />
        <Circle cx={CX} cy={CX} r={29.1} fill="none" stroke="#8b0000" strokeWidth={0.6} opacity={0.8} />
        <Circle cx={CX} cy={CX} r={9.7}  fill="none" stroke="#e65100" strokeWidth={0.6} opacity={0.8} />

        {/* Cruz central */}
        <Line x1={CX - 6} y1={CX} x2={CX + 6} y2={CX} stroke="#ffffff" strokeWidth={1} opacity={0.7} />
        <Line x1={CX} y1={CX - 6} x2={CX} y2={CX + 6} stroke="#ffffff" strokeWidth={1} opacity={0.7} />

        {/* Punto de tendencia */}
        {tendency && (
          <>
            <Line
              x1={CX} y1={CX}
              x2={tendencyDotX} y2={tendencyDotY}
              stroke={theme.accent}
              strokeWidth={1.5}
              opacity={0.6}
              strokeDasharray="4,3"
            />
            <Circle cx={tendencyDotX} cy={tendencyDotY} r={14} fill={theme.accent} opacity={0.2} />
            <Circle cx={tendencyDotX} cy={tendencyDotY} r={7} fill={theme.accent} opacity={0.8} />
          </>
        )}
      </Svg>

      {!hasRealData && (
        <View style={styles.targetOverlay}>
          <Ionicons name="lock-closed" size={28} color="#ffffff" />
          <Text style={styles.targetOverlayText}>
            Disponible con{'\n'}modelo IA entrenado
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────
export default function StatsScreen() {
  const theme = useThemeStore((s) => s.theme);
  const { sessions } = useAppStore();

  const stats = useMemo(() => {
    if (sessions.length === 0) return null;

    const allArrows = sessions.flatMap((s) => s.ends.flatMap((e) => e.arrows));
    const allEnds = sessions.flatMap((s) => s.ends);

    const distribution: Partial<Record<ArrowScore, number>> = {};
    for (const a of allArrows) distribution[a] = (distribution[a] ?? 0) + 1;

    const last8 = [...sessions].slice(0, 8).reverse();
    const efficiencies = last8.map((s) =>
      Math.round((s.grandTotal / s.maxPossible) * 100)
    );

    const avgEfficiency = Math.round(
      sessions.reduce((a, s) => a + (s.grandTotal / s.maxPossible) * 100, 0) / sessions.length
    );

    const bestSession = sessions.reduce((a, b) =>
      b.grandTotal / b.maxPossible > a.grandTotal / a.maxPossible ? b : a
    );

    const bestEnd = allEnds.reduce<typeof allEnds[0] | null>(
      (a, b) => (a === null || b.total > a.total ? b : a),
      null
    );

    const mostFrequent = (Object.entries(distribution) as [ArrowScore, number][])
      .sort((a, b) => b[1] - a[1])[0] ?? null;

    const byRound: Record<string, typeof sessions> = {};
    for (const s of sessions) {
      if (!byRound[s.roundType]) byRound[s.roundType] = [];
      byRound[s.roundType].push(s);
    }

    return {
      total: sessions.length,
      avgEfficiency,
      bestScore: bestSession.grandTotal,
      bestScoreMax: bestSession.maxPossible,
      efficiencies,
      distribution,
      bestEnd,
      mostFrequent,
      byRound,
      rankResult: computeRank(sessions),
    };
  }, [sessions]);

  if (!stats) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.bg }]}>
        <Ionicons name="bar-chart-outline" size={48} color={theme.textMuted} />
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Sin datos todavía</Text>
        <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
          Registra tu primera sesión para ver tus estadísticas.
        </Text>
      </View>
    );
  }

  const scoreOrder: ArrowScore[] = ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'];
  const distEntries = scoreOrder
    .map((s) => [s, stats.distribution[s] ?? 0] as [ArrowScore, number]);
  const maxCount = Math.max(...distEntries.map(([, c]) => c));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Rango actual */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Rango actual</Text>
      <RankCard result={stats.rankResult} />

      {/* Resumen global */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>Resumen global</Text>
      <View style={styles.statsRow}>
        <StatCard label="Sesiones" value={String(stats.total)} />
        <StatCard label="Eficiencia" value={`${stats.avgEfficiency}%`} sub="media" />
        <StatCard
          label="Mejor marca"
          value={String(stats.bestScore)}
          sub={`/ ${stats.bestScoreMax}`}
        />
      </View>

      {/* Gráfico de progreso */}
      {stats.efficiencies.length >= 2 && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>
            Evolución — últimas {stats.efficiencies.length} sesiones
          </Text>
          <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <ProgressChart data={stats.efficiencies} accentColor={theme.accent} />
          </View>
        </>
      )}

      {/* Distribución */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>
        Distribución de puntuaciones
      </Text>
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        {distEntries.map(([score, count], i) => (
          <ScoreBar
            key={score}
            score={score}
            count={count}
            maxCount={maxCount}
            delay={i * 50}
          />
        ))}
      </View>

      {/* Records */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>
        Records
      </Text>
      <View style={styles.recordsGrid}>
        {stats.bestEnd && (
          <View style={[styles.recordCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.recordValue, { color: theme.accent }]}>{stats.bestEnd.total}</Text>
            <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Mejor serie</Text>
          </View>
        )}
        {stats.mostFrequent && (
          <View style={[styles.recordCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.recordValue, { color: SCORE_COLORS[stats.mostFrequent[0]] }]}>
              {stats.mostFrequent[0]}
            </Text>
            <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>
              Puntuación más frecuente
            </Text>
          </View>
        )}
      </View>

      {/* Por modalidad */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>
        Por modalidad
      </Text>
      {Object.entries(stats.byRound).map(([type, ss]) => {
        const avg = Math.round(ss.reduce((a, s) => a + s.grandTotal, 0) / ss.length);
        const best = Math.max(...ss.map((s) => s.grandTotal));
        return (
          <View
            key={type}
            style={[styles.roundCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
          >
            <View style={styles.roundCardLeft}>
              <Text style={[styles.roundCardTitle, { color: theme.textPrimary }]}>
                {roundLabel(type as any)}
              </Text>
              <Text style={[styles.roundCardSub, { color: theme.textSecondary }]}>
                {ss.length} {ss.length === 1 ? 'sesión' : 'sesiones'}
              </Text>
            </View>
            <View style={styles.roundCardRight}>
              <View style={styles.roundStat}>
                <Text style={[styles.roundStatValue, { color: theme.accent }]}>{avg}</Text>
                <Text style={[styles.roundStatLabel, { color: theme.textMuted }]}>media</Text>
              </View>
              <View style={[styles.roundDivider, { backgroundColor: theme.border }]} />
              <View style={styles.roundStat}>
                <Text style={[styles.roundStatValue, { color: theme.textPrimary }]}>{best}</Text>
                <Text style={[styles.roundStatLabel, { color: theme.textMuted }]}>mejor</Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Diana de tendencia — placeholder */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>
        Tendencia en diana
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.bgCard, borderColor: theme.border, alignItems: 'center', paddingVertical: 24 },
        ]}
      >
        <TendencyTarget sessions={sessions} />
        <Text style={[styles.placeholderNote, { color: theme.textMuted }]}>
          El análisis de tendencia mostrará dónde tienes mayor dispersión (arriba, abajo, derecha,
          izquierda) una vez el modelo de IA esté entrenado.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: CARD_PADDING, paddingBottom: 60 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  statSub: { fontSize: 11, marginTop: 2 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  chartContainer: { flexDirection: 'row' },
  yLabels: { justifyContent: 'space-between', paddingLeft: 8, paddingBottom: 2 },
  yLabel: { fontSize: 10, color: '#606070' },
  scoreBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  scoreBarBadge: {
    width: 32,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBarLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  scoreBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: 8, borderRadius: 4 },
  scoreBarCount: { width: 28, fontSize: 12, textAlign: 'right' },
  recordsGrid: { flexDirection: 'row', gap: 12 },
  recordCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center' },
  recordValue: { fontSize: 36, fontWeight: '900' },
  recordLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  roundCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roundCardLeft: { flex: 1 },
  roundCardTitle: { fontSize: 15, fontWeight: '700' },
  roundCardSub: { fontSize: 12, marginTop: 2 },
  roundCardRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roundStat: { alignItems: 'center' },
  roundStatValue: { fontSize: 20, fontWeight: '800' },
  roundStatLabel: { fontSize: 10, marginTop: 2 },
  roundDivider: { width: 1, height: 32 },
  targetWrapper: { position: 'relative', width: 200, height: 200 },
  targetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  targetOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  placeholderNote: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});
