// src/screens/VSScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useAppStore } from '../store/useAppStore';
import { useVSStore } from '../store/useVSStore';
import { computeRank } from '../types/ranks';
import RankEmblem from '../components/RankEmblem';
import type { ArrowScore, RoundType } from '../types';
import { ARROW_SCORES, scoreTextColor, scoreBgColor, scoreBorderColor, roundLabel } from '../types';
import { vsTotal, vsEndTotal } from '../types/vs';
import type { VSPlayer } from '../types/vs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ROUND_OPTIONS: { type: RoundType; arrowsPerEnd: number; totalEnds: number }[] = [
  { type: 'indoor_18m', arrowsPerEnd: 3, totalEnds: 10 },
  { type: 'indoor_25m', arrowsPerEnd: 3, totalEnds: 10 },
  { type: 'outdoor_30m', arrowsPerEnd: 6, totalEnds: 6 },
  { type: 'outdoor_50m', arrowsPerEnd: 6, totalEnds: 6 },
  { type: 'outdoor_70m', arrowsPerEnd: 6, totalEnds: 6 },
  { type: 'custom', arrowsPerEnd: 3, totalEnds: 10 },
];

// ─── Score Badge ──────────────────────────────────────────────────
function ScoreBadge({ score }: { score: ArrowScore }) {
  return (
    <View style={[
      scoreBadgeStyles.badge,
      { backgroundColor: scoreBgColor(score), borderColor: scoreBorderColor(score) },
    ]}>
      <Text style={[scoreBadgeStyles.text, { color: scoreTextColor(score) }]}>{score}</Text>
    </View>
  );
}

const scoreBadgeStyles = StyleSheet.create({
  badge: {
    width: 30, height: 22, borderRadius: 6, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  text: { fontSize: 12, fontWeight: '700' },
});

// ─── Player Setup Card ────────────────────────────────────────────
function PlayerSetupCard({
  label,
  name,
  onChangeName,
  rankId,
  rankColor,
  rankName,
  theme,
}: {
  label: string;
  name: string;
  onChangeName: (v: string) => void;
  rankId: number;
  rankColor: string;
  rankName: string;
  theme: any;
}) {
  return (
    <View style={[setupStyles.playerCard, { backgroundColor: theme.bgCard, borderColor: rankColor + '55' }]}>
      <View style={setupStyles.playerHeader}>
        <RankEmblem rankId={rankId} color={rankColor} size={44} />
        <View style={setupStyles.playerHeaderInfo}>
          <Text style={[setupStyles.playerLabel, { color: theme.textMuted }]}>{label}</Text>
          <Text style={[setupStyles.playerRank, { color: rankColor }]}>{rankName}</Text>
        </View>
      </View>
      <TextInput
        style={[setupStyles.nameInput, {
          backgroundColor: theme.bgInput,
          borderColor: theme.border,
          color: theme.textPrimary,
        }]}
        value={name}
        onChangeText={onChangeName}
        placeholder="Nombre del jugador"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel={`Nombre de ${label}`}
      />
    </View>
  );
}

const setupStyles = StyleSheet.create({
  playerCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 12 },
  playerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  playerHeaderInfo: { flex: 1 },
  playerLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  playerRank: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  nameInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15 },
});

// ─── Arrow Picker ─────────────────────────────────────────────────
function ArrowPicker({
  arrows,
  onConfirm,
  arrowsPerEnd,
  theme,
}: {
  arrows: ArrowScore[];
  onConfirm: (arrows: ArrowScore[]) => void;
  arrowsPerEnd: number;
  theme: any;
}) {
  const [selected, setSelected] = useState<ArrowScore[]>(arrows);
  const [editingIndex, setEditingIndex] = useState<number>(0);

  function handleSelect(score: ArrowScore) {
    const next = [...selected];
    next[editingIndex] = score;
    setSelected(next);
    if (editingIndex < arrowsPerEnd - 1) {
      setEditingIndex(editingIndex + 1);
    }
  }

  const total = selected.reduce((a, s) => {
    if (s === 'X' || s === '10') return a + 10;
    if (s === 'M') return a;
    return a + parseInt(s, 10);
  }, 0);

  const isComplete = selected.length === arrowsPerEnd && selected.every(s => s !== undefined);

  return (
    <View>
      {/* Flechas seleccionadas */}
      <View style={pickerStyles.arrowsRow}>
        {Array.from({ length: arrowsPerEnd }).map((_, i) => {
          const score = selected[i];
          return (
            <Pressable
              key={i}
              onPress={() => setEditingIndex(i)}
              style={[
                pickerStyles.arrowSlot,
                {
                  backgroundColor: score ? scoreBgColor(score) : theme.bgInput,
                  borderColor: score ? scoreBorderColor(score) : editingIndex === i ? theme.accent : theme.border,
                  borderWidth: editingIndex === i ? 2 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Flecha ${i + 1}`}
            >
              {score ? (
                <Text style={[pickerStyles.arrowSlotText, { color: scoreTextColor(score) }]}>{score}</Text>
              ) : (
                <Text style={[pickerStyles.arrowSlotPlaceholder, { color: theme.textMuted }]}>-</Text>
              )}
            </Pressable>
          );
        })}
        <View style={[pickerStyles.totalBox, { backgroundColor: theme.accentSoft }]}>
          <Text style={[pickerStyles.totalText, { color: theme.accent }]}>{total}</Text>
          <Text style={[pickerStyles.totalLabel, { color: theme.accent }]}>pts</Text>
        </View>
      </View>

      {/* Grid de puntuaciones */}
      <View style={pickerStyles.scoreGrid}>
        {ARROW_SCORES.map((s) => (
          <Pressable
            key={s}
            style={[
              pickerStyles.scoreChip,
              {
                backgroundColor: scoreBgColor(s),
                borderColor: scoreBorderColor(s),
                borderWidth: selected[editingIndex] === s ? 2.5 : 1,
              },
            ]}
            onPress={() => handleSelect(s)}
            accessibilityRole="button"
            accessibilityLabel={`Puntuación ${s}`}
          >
            <Text style={[pickerStyles.scoreChipText, { color: scoreTextColor(s) }]}>{s}</Text>
          </Pressable>
        ))}
      </View>

      {/* Botón confirmar */}
      <Pressable
        style={[
          pickerStyles.confirmButton,
          { backgroundColor: isComplete ? theme.accent : theme.border },
        ]}
        onPress={() => isComplete && onConfirm(selected)}
        disabled={!isComplete}
        accessibilityRole="button"
        accessibilityLabel="Confirmar serie"
      >
        <Text style={[pickerStyles.confirmText, { color: isComplete ? '#fff' : theme.textMuted }]}>
          Confirmar serie
        </Text>
      </Pressable>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  arrowsRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 20 },
  arrowSlot: {
    flex: 1, height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  arrowSlotText: { fontSize: 22, fontWeight: '900' },
  arrowSlotPlaceholder: { fontSize: 22, fontWeight: '300' },
  totalBox: {
    width: 52, height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  totalText: { fontSize: 18, fontWeight: '900' },
  totalLabel: { fontSize: 10, fontWeight: '600' },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  scoreChip: {
    width: (SCREEN_WIDTH - 40 - 8 * 5) / 6,
    height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  scoreChipText: { fontSize: 16, fontWeight: '800' },
  confirmButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmText: { fontSize: 16, fontWeight: '800' },
});

// ─── Scoreboard ───────────────────────────────────────────────────
function Scoreboard({ match, theme }: { match: any; theme: any }) {
  const total1 = vsTotal(match.ends1);
  const total2 = vsTotal(match.ends2);
  const maxPossible = match.arrowsPerEnd * match.totalEnds * 10;
  const pct1 = maxPossible > 0 ? (total1 / maxPossible) * 100 : 0;
  const pct2 = maxPossible > 0 ? (total2 / maxPossible) * 100 : 0;
  const diff = total1 - total2;

  return (
    <View style={[scoreboardStyles.container, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <View style={scoreboardStyles.playersRow}>
        <View style={[scoreboardStyles.playerCol, { alignItems: 'flex-start' }]}>
          <RankEmblem rankId={match.player1.rankId} color={match.player1.rankColor} size={36} />
          <Text style={[scoreboardStyles.playerName, { color: theme.textPrimary }]} numberOfLines={1}>
            {match.player1.name}
          </Text>
          <Text style={[scoreboardStyles.playerScore, { color: match.player1.rankColor }]}>{total1}</Text>
        </View>

        <View style={scoreboardStyles.vsCenter}>
          <Text style={[scoreboardStyles.vsText, { color: theme.accent }]}>VS</Text>
          {diff !== 0 && (
            <Text style={[scoreboardStyles.diffText, { color: diff > 0 ? match.player1.rankColor : match.player2.rankColor }]}>
              {diff > 0 ? `+${diff}` : diff}
            </Text>
          )}
          {diff === 0 && match.ends1.length > 0 && (
            <Text style={[scoreboardStyles.diffText, { color: theme.textMuted }]}>Empate</Text>
          )}
        </View>

        <View style={[scoreboardStyles.playerCol, { alignItems: 'flex-end' }]}>
          <RankEmblem rankId={match.player2.rankId} color={match.player2.rankColor} size={36} />
          <Text style={[scoreboardStyles.playerName, { color: theme.textPrimary }]} numberOfLines={1}>
            {match.player2.name}
          </Text>
          <Text style={[scoreboardStyles.playerScore, { color: match.player2.rankColor }]}>{total2}</Text>
        </View>
      </View>

      {/* Barra comparativa */}
      <View style={scoreboardStyles.barContainer}>
        <View style={[scoreboardStyles.barBg, { backgroundColor: theme.border }]}>
          <View style={[
            scoreboardStyles.barFill1,
            { width: `${pct1 / (pct1 + pct2 || 1) * 100}%`, backgroundColor: match.player1.rankColor },
          ]} />
        </View>
      </View>

      {/* Tabla de series */}
      {match.ends1.length > 0 && (
        <View style={[scoreboardStyles.endsTable, { borderTopColor: theme.border }]}>
          <View style={scoreboardStyles.endsHeader}>
            <Text style={[scoreboardStyles.endsHeaderText, { color: theme.textMuted }]}>Serie</Text>
            <Text style={[scoreboardStyles.endsHeaderText, { color: match.player1.rankColor }]}>
              {match.player1.name.split(' ')[0]}
            </Text>
            <Text style={[scoreboardStyles.endsHeaderText, { color: match.player2.rankColor }]}>
              {match.player2.name.split(' ')[0]}
            </Text>
            <Text style={[scoreboardStyles.endsHeaderText, { color: theme.textMuted }]}>Dif</Text>
          </View>
          {match.ends1.map((e1: any, i: number) => {
            const e2 = match.ends2[i];
            const endDiff = e2 ? e1.total - e2.total : null;
            return (
              <View key={i} style={[scoreboardStyles.endRow, { borderTopColor: theme.border }]}>
                <Text style={[scoreboardStyles.endCell, { color: theme.textMuted }]}>{e1.endNumber}</Text>
                <Text style={[scoreboardStyles.endCell, { color: theme.textPrimary, fontWeight: '700' }]}>
                  {e1.total}
                </Text>
                <Text style={[scoreboardStyles.endCell, { color: theme.textPrimary, fontWeight: '700' }]}>
                  {e2 ? e2.total : '-'}
                </Text>
                <Text style={[
                  scoreboardStyles.endCell,
                  {
                    color: endDiff === null
                      ? theme.textMuted
                      : endDiff > 0 ? match.player1.rankColor
                      : endDiff < 0 ? match.player2.rankColor
                      : theme.textMuted,
                  },
                ]}>
                  {endDiff === null ? '-' : endDiff > 0 ? `+${endDiff}` : endDiff === 0 ? '=' : endDiff}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const scoreboardStyles = StyleSheet.create({
  container: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  playersRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  playerCol: { flex: 1, gap: 4 },
  playerName: { fontSize: 14, fontWeight: '700' },
  playerScore: { fontSize: 28, fontWeight: '900' },
  vsCenter: { alignItems: 'center', paddingHorizontal: 12 },
  vsText: { fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  diffText: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  barContainer: { marginBottom: 12 },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill1: { height: 6, borderRadius: 3 },
  endsTable: { borderTopWidth: 1, paddingTop: 12 },
  endsHeader: { flexDirection: 'row', marginBottom: 6 },
  endsHeaderText: { flex: 1, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' },
  endRow: { flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1 },
  endCell: { flex: 1, fontSize: 14, textAlign: 'center' },
});

// ─── Pantalla principal ───────────────────────────────────────────
export default function VSScreen() {
  const theme = useThemeStore((s) => s.theme);
  const { sessions } = useAppStore();
  const { currentMatch, createMatch, submitEnd, finishMatch, clearCurrent, matches, loadMatches } = useVSStore();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<'home' | 'setup' | 'playing' | 'endReview' | 'finished'>('home');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [selectedRound, setSelectedRound] = useState(ROUND_OPTIONS[0]);

  const rankResult = computeRank(sessions.filter(s => s.ends.length >= s.totalEnds));

  useEffect(() => { loadMatches(); }, []);

  useEffect(() => {
    if (currentMatch?.status === 'finished') setPhase('finished');
  }, [currentMatch?.status]);

  function buildPlayer(name: string): VSPlayer {
    return {
      name: name.trim() || 'Jugador',
      rankId: rankResult.rank.id,
      rankColor: rankResult.rank.color,
      rankName: rankResult.rank.name,
    };
  }

  function handleCreateMatch() {
    if (!player1Name.trim() || !player2Name.trim()) {
      Alert.alert('Faltan nombres', 'Introduce el nombre de los dos jugadores.');
      return;
    }
    createMatch({
      player1: buildPlayer(player1Name),
      player2: buildPlayer(player2Name),
      roundType: selectedRound.type,
      arrowsPerEnd: selectedRound.arrowsPerEnd,
      totalEnds: selectedRound.totalEnds,
    });
    setPhase('playing');
  }

  function handleConfirmEnd(arrows: ArrowScore[]) {
    submitEnd(arrows);
    setPhase('endReview');
  }

  function handleNextTurn() {
    if (currentMatch?.status === 'finished') {
      finishMatch();
      setPhase('finished');
    } else {
      setPhase('playing');
    }
  }

  function handleRestart() {
    clearCurrent();
    setPlayer1Name('');
    setPlayer2Name('');
    setPhase('home');
  }

  // ── FASE HOME ────────────────────────────────────────────────────
  if (phase === 'home') {
    return (
      <ScrollView
        style={[s.container, { backgroundColor: theme.bg }]}
        contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
      >
        <View style={s.homeHeader}>
          <Text style={[s.homeTitle, { color: theme.accent }]}>VS</Text>
          <Text style={[s.homeSubtitle, { color: theme.textPrimary }]}>Modo competición</Text>
          <Text style={[s.homeDesc, { color: theme.textSecondary }]}>
            Dos jugadores, un teléfono. El que más puntos acumule gana.
          </Text>
        </View>

        <Pressable
          style={[s.primaryButton, { backgroundColor: theme.accent }]}
          onPress={() => setPhase('setup')}
          accessibilityRole="button"
          accessibilityLabel="Nueva partida VS"
        >
          <Ionicons name="flash" size={22} color="#fff" />
          <Text style={s.primaryButtonText}>Nueva partida</Text>
        </Pressable>

        {matches.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textMuted, marginTop: 28 }]}>Partidas anteriores</Text>
            {matches.slice(0, 5).map((m) => {
              const t1 = vsTotal(m.ends1);
              const t2 = vsTotal(m.ends2);
              return (
                <View key={m.id} style={[s.matchHistoryCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                  <View style={s.matchHistoryRow}>
                    <Text style={[s.matchHistoryName, { color: m.winner === 1 ? m.player1.rankColor : theme.textSecondary }]}>
                      {m.player1.name} {m.winner === 1 && '✓'}
                    </Text>
                    <Text style={[s.matchHistoryScore, { color: theme.textPrimary }]}>{t1} — {t2}</Text>
                    <Text style={[s.matchHistoryName, { color: m.winner === 2 ? m.player2.rankColor : theme.textSecondary, textAlign: 'right' }]}>
                      {m.winner === 2 && '✓'} {m.player2.name}
                    </Text>
                  </View>
                  <Text style={[s.matchHistoryMeta, { color: theme.textMuted }]}>
                    {roundLabel(m.roundType as any)} · {m.totalEnds} series
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    );
  }

  // ── FASE SETUP ───────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <ScrollView
        style={[s.container, { backgroundColor: theme.bg }]}
        contentContainerStyle={[s.content, { paddingBottom: 60 }]}
      >
        <Text style={[s.sectionTitle, { color: theme.textMuted }]}>Jugadores</Text>
        <PlayerSetupCard
          label="Jugador 1"
          name={player1Name}
          onChangeName={setPlayer1Name}
          rankId={rankResult.rank.id}
          rankColor={rankResult.rank.color}
          rankName={rankResult.rank.name}
          theme={theme}
        />
        <PlayerSetupCard
          label="Jugador 2"
          name={player2Name}
          onChangeName={setPlayer2Name}
          rankId={1}
          rankColor="#8D6E63"
          rankName="Arquero Novel"
          theme={theme}
        />

        <Text style={[s.sectionTitle, { color: theme.textMuted, marginTop: 20 }]}>Modalidad</Text>
        <View style={s.roundGrid}>
          {ROUND_OPTIONS.map((opt) => (
            <Pressable
              key={opt.type}
              style={[s.roundChip, {
                backgroundColor: selectedRound.type === opt.type ? theme.accentSoft : theme.bgCard,
                borderColor: selectedRound.type === opt.type ? theme.accent : theme.border,
              }]}
              onPress={() => setSelectedRound(opt)}
              accessibilityRole="radio"
              accessibilityLabel={roundLabel(opt.type)}
            >
              <Text style={[s.roundChipText, { color: selectedRound.type === opt.type ? theme.accent : theme.textSecondary }]}>
                {roundLabel(opt.type)}
              </Text>
              {opt.type !== 'custom' && (
                <Text style={[s.roundChipSub, { color: selectedRound.type === opt.type ? theme.accent : theme.textMuted }]}>
                  {opt.totalEnds}×{opt.arrowsPerEnd}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[s.primaryButton, { backgroundColor: theme.accent, marginTop: 28 }]}
          onPress={handleCreateMatch}
          accessibilityRole="button"
          accessibilityLabel="Empezar partida"
        >
          <Text style={s.primaryButtonText}>Empezar partida</Text>
        </Pressable>

        <Pressable
          style={[s.secondaryButton, { borderColor: theme.border }]}
          onPress={handleRestart}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
        >
          <Text style={[s.secondaryButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (!currentMatch) return null;

  // ── FASE PLAYING ─────────────────────────────────────────────────
  if (phase === 'playing') {
    const isP1 = currentMatch.currentPlayer === 1;
    const currentPlayer = isP1 ? currentMatch.player1 : currentMatch.player2;
    const initialArrows = Array(currentMatch.arrowsPerEnd).fill('M') as ArrowScore[];

    return (
      <ScrollView
        style={[s.container, { backgroundColor: theme.bg }]}
        contentContainerStyle={[s.content, { paddingBottom: 60 }]}
      >
        <Scoreboard match={currentMatch} theme={theme} />

        <View style={[s.turnCard, { backgroundColor: currentPlayer.rankColor + '18', borderColor: currentPlayer.rankColor }]}>
          <View style={s.turnHeader}>
            <RankEmblem rankId={currentPlayer.rankId} color={currentPlayer.rankColor} size={40} />
            <View style={s.turnInfo}>
              <Text style={[s.turnLabel, { color: theme.textMuted }]}>Turno de</Text>
              <Text style={[s.turnName, { color: currentPlayer.rankColor }]}>{currentPlayer.name}</Text>
              <Text style={[s.turnSerie, { color: theme.textSecondary }]}>
                Serie {currentMatch.currentEnd} de {currentMatch.totalEnds}
              </Text>
            </View>
          </View>
        </View>

        <View style={[s.pickerCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[s.pickerTitle, { color: theme.textMuted }]}>Introduce las puntuaciones</Text>
          <ArrowPicker
            arrows={initialArrows}
            onConfirm={handleConfirmEnd}
            arrowsPerEnd={currentMatch.arrowsPerEnd}
            theme={theme}
          />
        </View>
      </ScrollView>
    );
  }

  // ── FASE END REVIEW ──────────────────────────────────────────────
  if (phase === 'endReview') {
    const justFinishedP1 = currentMatch.currentPlayer === 2;
    const justFinished = justFinishedP1 ? currentMatch.player1 : currentMatch.player2;
    const endData = justFinishedP1
      ? currentMatch.ends1[currentMatch.ends1.length - 1]
      : currentMatch.ends2[currentMatch.ends2.length - 1];

    const nextLabel = currentMatch.status === 'finished'
      ? 'Ver resultado final'
      : justFinishedP1
      ? `Turno de ${currentMatch.player2.name}`
      : `Serie ${currentMatch.currentEnd} — ${currentMatch.player1.name}`;

    return (
      <ScrollView
        style={[s.container, { backgroundColor: theme.bg }]}
        contentContainerStyle={[s.content, { paddingBottom: 60 }]}
      >
        <Scoreboard match={currentMatch} theme={theme} />

        <View style={[s.reviewCard, { backgroundColor: theme.bgCard, borderColor: justFinished.rankColor + '55' }]}>
          <Text style={[s.reviewTitle, { color: theme.textMuted }]}>Serie registrada</Text>
          <Text style={[s.reviewPlayer, { color: justFinished.rankColor }]}>{justFinished.name}</Text>
          {endData && (
            <>
              <View style={s.reviewArrows}>
                {endData.arrows.map((a, i) => <ScoreBadge key={i} score={a} />)}
              </View>
              <Text style={[s.reviewTotal, { color: justFinished.rankColor }]}>{endData.total} pts</Text>
            </>
          )}
        </View>

        <Pressable
          style={[s.primaryButton, { backgroundColor: theme.accent }]}
          onPress={handleNextTurn}
          accessibilityRole="button"
          accessibilityLabel={nextLabel}
        >
          <Text style={s.primaryButtonText}>{nextLabel}</Text>
          {currentMatch.status !== 'finished' && <Ionicons name="arrow-forward" size={18} color="#fff" />}
        </Pressable>
      </ScrollView>
    );
  }

  // ── FASE FINISHED ────────────────────────────────────────────────
  if (phase === 'finished') {
    const t1 = vsTotal(currentMatch.ends1);
    const t2 = vsTotal(currentMatch.ends2);
    const winner = currentMatch.winner;
    const winnerPlayer = winner === 1 ? currentMatch.player1 : winner === 2 ? currentMatch.player2 : null;
    const diff = Math.abs(t1 - t2);

    return (
      <ScrollView
        style={[s.container, { backgroundColor: theme.bg }]}
        contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: 60 }]}
      >
        <View style={[s.resultCard, {
          backgroundColor: winnerPlayer ? winnerPlayer.rankColor + '18' : theme.bgCard,
          borderColor: winnerPlayer ? winnerPlayer.rankColor : theme.border,
        }]}>
          {winnerPlayer ? (
            <>
              <RankEmblem rankId={winnerPlayer.rankId} color={winnerPlayer.rankColor} size={72} />
              <Text style={[s.resultTitle, { color: winnerPlayer.rankColor }]}>
                {winnerPlayer.name} gana
              </Text>
              <Text style={[s.resultDiff, { color: theme.textSecondary }]}>
                por {diff} {diff === 1 ? 'punto' : 'puntos'}
              </Text>
            </>
          ) : (
            <>
              <Text style={[s.resultTitle, { color: theme.accent }]}>Empate</Text>
              <Text style={[s.resultDiff, { color: theme.textSecondary }]}>{t1} — {t2}</Text>
            </>
          )}
        </View>

        <Scoreboard match={currentMatch} theme={theme} />

        <Pressable
          style={[s.primaryButton, { backgroundColor: theme.accent }]}
          onPress={() => {
            createMatch({
              player1: currentMatch.player2,
              player2: currentMatch.player1,
              roundType: currentMatch.roundType,
              arrowsPerEnd: currentMatch.arrowsPerEnd,
              totalEnds: currentMatch.totalEnds,
            });
            setPhase('playing');
          }}
          accessibilityRole="button"
          accessibilityLabel="Revancha"
        >
          <Text style={s.primaryButtonText}>Revancha</Text>
        </Pressable>

        <Pressable
          style={[s.secondaryButton, { borderColor: theme.border }]}
          onPress={handleRestart}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
        >
          <Text style={[s.secondaryButtonText, { color: theme.textSecondary }]}>Volver al inicio</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return null;
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1.2, marginBottom: 12,
  },
  homeHeader: { alignItems: 'center', marginBottom: 32, paddingTop: 20 },
  homeTitle: { fontSize: 56, fontWeight: '900', letterSpacing: 6 },
  homeSubtitle: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  homeDesc: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  primaryButton: {
    flexDirection: 'row', gap: 10, borderRadius: 14, padding: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  primaryButtonText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  secondaryButton: { borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
  roundGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roundChip: { borderRadius: 10, borderWidth: 1, padding: 12, minWidth: '45%', flex: 1 },
  roundChipText: { fontSize: 13, fontWeight: '700' },
  roundChipSub: { fontSize: 11, marginTop: 2 },
  matchHistoryCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  matchHistoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matchHistoryName: { flex: 1, fontSize: 13, fontWeight: '700' },
  matchHistoryScore: { fontSize: 15, fontWeight: '900', paddingHorizontal: 8 },
  matchHistoryMeta: { fontSize: 11, marginTop: 4 },
  turnCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  turnHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  turnInfo: { flex: 1 },
  turnLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  turnName: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  turnSerie: { fontSize: 13, marginTop: 2 },
  pickerCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  pickerTitle: {
    fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 16,
  },
  reviewCard: { borderRadius: 16, borderWidth: 1.5, padding: 20, alignItems: 'center', marginBottom: 16 },
  reviewTitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  reviewPlayer: { fontSize: 22, fontWeight: '900', marginTop: 6 },
  reviewArrows: { flexDirection: 'row', gap: 8, marginTop: 12 },
  reviewTotal: { fontSize: 36, fontWeight: '900', marginTop: 8 },
  resultCard: { borderRadius: 20, borderWidth: 1.5, padding: 28, alignItems: 'center', marginBottom: 20 },
  resultTitle: { fontSize: 28, fontWeight: '900', marginTop: 12 },
  resultDiff: { fontSize: 15, marginTop: 6 },
});
