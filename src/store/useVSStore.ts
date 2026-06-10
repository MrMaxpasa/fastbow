import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VSMatch, VSPlayer, VSEnd } from '../types/vs';
import { determineWinner, vsEndTotal } from '../types/vs';
import type { ArrowScore } from '../types';

const VS_KEY = 'fastbow_vs_matches';

interface VSState {
  matches: VSMatch[];
  currentMatch: VSMatch | null;
  loadMatches: () => Promise<void>;
  createMatch: (config: {
    player1: VSPlayer;
    player2: VSPlayer;
    roundType: string;
    arrowsPerEnd: number;
    totalEnds: number;
  }) => VSMatch;
  submitEnd: (arrows: ArrowScore[]) => void;
  finishMatch: () => void;
  clearCurrent: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function save(matches: VSMatch[]) {
  AsyncStorage.setItem(VS_KEY, JSON.stringify(matches));
}

export const useVSStore = create<VSState>((set, get) => ({
  matches: [],
  currentMatch: null,

  loadMatches: async () => {
    const raw = await AsyncStorage.getItem(VS_KEY);
    set({ matches: raw ? JSON.parse(raw) : [] });
  },

  createMatch: (config) => {
    const match: VSMatch = {
      id: generateId(),
      ...config,
      ends1: [],
      ends2: [],
      currentEnd: 1,
      currentPlayer: 1,
      status: 'playing',
      winner: null,
      date: Date.now(),
    };
    set({ currentMatch: match });
    return match;
  },

  submitEnd: (arrows) => {
    const match = get().currentMatch;
    if (!match) return;

    const end: VSEnd = {
      endNumber: match.currentEnd,
      arrows,
      total: vsEndTotal(arrows),
    };

    let updated: VSMatch;

    if (match.currentPlayer === 1) {
      updated = {
        ...match,
        ends1: [...match.ends1, end],
        currentPlayer: 2,
      };
    } else {
      const nextEnd = match.currentEnd + 1;
      const isFinished = nextEnd > match.totalEnds;
      const newEnds2 = [...match.ends2, end];

      updated = {
        ...match,
        ends2: newEnds2,
        currentEnd: isFinished ? match.currentEnd : nextEnd,
        currentPlayer: 1,
        status: isFinished ? 'finished' : 'playing',
        winner: isFinished ? determineWinner({ ...match, ends2: newEnds2 }) : null,
      };
    }

    set({ currentMatch: updated });
  },

  finishMatch: () => {
    const match = get().currentMatch;
    if (!match) return;
    const finished = { ...match, status: 'finished' as const };
    const matches = [finished, ...get().matches];
    set({ matches, currentMatch: finished });
    save(matches);
  },

  clearCurrent: () => set({ currentMatch: null }),
}));
