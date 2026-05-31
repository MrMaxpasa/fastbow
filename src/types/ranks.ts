import { Session } from './index';

export interface Rank {
  id: number;
  name: string;
  color: string;
  minScore: number;
}

export const RANKS: Rank[] = [
  { id: 1, name: 'Arquero Novel',       color: '#8D6E63', minScore: 0  },
  { id: 2, name: 'Arquero de Campo',    color: '#78909C', minScore: 25 },
  { id: 3, name: 'Tirador',             color: '#66BB6A', minScore: 38 },
  { id: 4, name: 'Tirador Experto',     color: '#26C6DA', minScore: 50 },
  { id: 5, name: 'Arquero Clasificado', color: '#5C6BC0', minScore: 62 },
  { id: 6, name: 'Arquero Nacional',    color: '#AB47BC', minScore: 72 },
  { id: 7, name: 'Arquero de Élite',    color: '#EF6C00', minScore: 82 },
  { id: 8, name: 'Maestro Arquero',     color: '#F9A825', minScore: 91 },
];

export interface RankResult {
  rank: Rank;
  score: number;
  isProvisional: boolean;
  sessionCount: number;
  nextRank: Rank | null;
  progressToNext: number;
  weightedAvg: number;
  consistency: number;
  bestMark: number;
}

function weightedAverage(sessions: Session[]): number {
  const last10 = [...sessions]
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  let totalWeight = 0;
  let weightedSum = 0;

  last10.forEach((s, i) => {
    const weight = last10.length - i;
    const efficiency = (s.grandTotal / s.maxPossible) * 100;
    weightedSum += efficiency * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function consistencyScore(sessions: Session[]): number {
  const last10 = [...sessions]
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  if (last10.length < 2) return 50;

  const efficiencies = last10.map((s) => (s.grandTotal / s.maxPossible) * 100);
  const mean = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
  const variance = efficiencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / efficiencies.length;
  const stdDev = Math.sqrt(variance);

  return Math.max(0, Math.min(100, 100 - stdDev * 5));
}

function bestMark(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  return Math.max(...sessions.map((s) => (s.grandTotal / s.maxPossible) * 100));
}

export function computeRank(sessions: Session[]): RankResult {
  const finished = sessions.filter((s) => s.ends.length >= s.totalEnds);
  const sessionCount = finished.length;

  const wAvg = weightedAverage(finished);
  const consistency = consistencyScore(finished);
  const best = bestMark(finished);

  const score = wAvg * 0.5 + consistency * 0.3 + best * 0.2;

  const rank = [...RANKS]
    .reverse()
    .find((r) => score >= r.minScore) ?? RANKS[0];

  const rankIndex = RANKS.findIndex((r) => r.id === rank.id);
  const nextRank = rankIndex < RANKS.length - 1 ? RANKS[rankIndex + 1] : null;

  let progressToNext = 100;
  if (nextRank) {
    const range = nextRank.minScore - rank.minScore;
    const progress = score - rank.minScore;
    progressToNext = Math.min(100, Math.max(0, (progress / range) * 100));
  }

  return {
    rank,
    score: Math.round(score * 10) / 10,
    isProvisional: sessionCount < 10,
    sessionCount,
    nextRank,
    progressToNext: Math.round(progressToNext),
    weightedAvg: Math.round(wAvg * 10) / 10,
    consistency: Math.round(consistency * 10) / 10,
    bestMark: Math.round(best * 10) / 10,
  };
}
