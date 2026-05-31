// src/store/useAppStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, End, Archer, ArrowScore, RoundType } from '../types';
import { endTotal, isSessionFinished } from '../types';

const SESSIONS_KEY = 'archery_sessions';
const ARCHER_KEY = 'archery_archer';

interface AppState {
  sessions: Session[];
  currentSession: Session | null;
  archer: Archer | null;
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;
  createSession: (config: {
    archerName: string;
    roundType: RoundType;
    arrowsPerEnd: number;
    totalEnds: number;
  }) => Session;
  addEnd: (sessionId: string, end: End) => void;
  updateEnd: (sessionId: string, endId: string, arrows: ArrowScore[]) => void;
  deleteSession: (sessionId: string) => void;
  setArcher: (archer: Archer) => void;
  getSession: (sessionId: string) => Session | undefined;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function computeGrandTotal(ends: End[]): number {
  return ends.reduce((acc, e) => acc + e.total, 0);
}

function computeMaxPossible(arrowsPerEnd: number, totalEnds: number): number {
  return arrowsPerEnd * totalEnds * 10;
}

export const useAppStore = create<AppState>((set, get) => ({
  sessions: [],
  currentSession: null,
  archer: null,
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [sessionsRaw, archerRaw] = await Promise.all([
        AsyncStorage.getItem(SESSIONS_KEY),
        AsyncStorage.getItem(ARCHER_KEY),
      ]);
      const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
      const current = sessions.find((s: Session) => !isSessionFinished(s)) ?? null;
      set({
        sessions,
        archer: archerRaw ? JSON.parse(archerRaw) : null,
        currentSession: current,
      });
    } catch {
      // silently ignore storage errors
    } finally {
      set({ isLoading: false });
    }
  },

  createSession: (config) => {
    const session: Session = {
      id: generateId(),
      archerName: config.archerName,
      date: Date.now(),
      roundType: config.roundType,
      arrowsPerEnd: config.arrowsPerEnd,
      totalEnds: config.totalEnds,
      ends: [],
      grandTotal: 0,
      maxPossible: computeMaxPossible(config.arrowsPerEnd, config.totalEnds),
    };
    const updated = [session, ...get().sessions];
    set({ sessions: updated, currentSession: session });
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return session;
  },

  addEnd: (sessionId, end) => {
    const sessions = get().sessions.map((s) => {
      if (s.id !== sessionId) return s;
      const ends = [...s.ends, end];
      return { ...s, ends, grandTotal: computeGrandTotal(ends) };
    });
    const currentSession = sessions.find((s) => s.id === sessionId) ?? null;
    set({ sessions, currentSession });
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  updateEnd: (sessionId, endId, arrows) => {
    const sessions = get().sessions.map((s) => {
      if (s.id !== sessionId) return s;
      const ends = s.ends.map((e) =>
        e.id === endId ? { ...e, arrows, total: endTotal(arrows) } : e
      );
      return { ...s, ends, grandTotal: computeGrandTotal(ends) };
    });
    set({ sessions });
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  deleteSession: (sessionId) => {
    const sessions = get().sessions.filter((s) => s.id !== sessionId);
    set({ sessions });
    AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  setArcher: (archer) => {
    set({ archer });
    AsyncStorage.setItem(ARCHER_KEY, JSON.stringify(archer));
  },

  getSession: (sessionId) => get().sessions.find((s) => s.id === sessionId),
}));
