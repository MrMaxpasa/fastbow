import type { ArrowScore } from './index';

export interface VSPlayer {
  name: string;
  rankId: number;
  rankColor: string;
  rankName: string;
}

export interface VSEnd {
  endNumber: number;
  arrows: ArrowScore[];
  total: number;
}

export interface VSMatch {
  id: string;
  player1: VSPlayer;
  player2: VSPlayer;
  roundType: string;
  arrowsPerEnd: number;
  totalEnds: number;
  ends1: VSEnd[];
  ends2: VSEnd[];
  currentEnd: number;
  currentPlayer: 1 | 2;
  status: 'setup' | 'playing' | 'finished';
  winner: 1 | 2 | 'draw' | null;
  date: number;
}

export function vsTotal(ends: VSEnd[]): number {
  return ends.reduce((a, e) => a + e.total, 0);
}

export function vsEndTotal(arrows: ArrowScore[]): number {
  return arrows.reduce((a, s) => {
    if (s === 'X' || s === '10') return a + 10;
    if (s === 'M') return a;
    return a + parseInt(s, 10);
  }, 0);
}

export function determineWinner(match: VSMatch): 1 | 2 | 'draw' {
  const t1 = vsTotal(match.ends1);
  const t2 = vsTotal(match.ends2);
  if (t1 > t2) return 1;
  if (t2 > t1) return 2;
  return 'draw';
}
