// src/types/index.ts

export type ArrowScore = 'X' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | '1' | 'M';

export type RoundType =
  | 'indoor_18m'
  | 'indoor_25m'
  | 'outdoor_30m'
  | 'outdoor_50m'
  | 'outdoor_70m'
  | 'field'
  | 'custom';

export interface ArrowDetection {
  score: ArrowScore;
  x: number;          // position on diana (0-1 normalized)
  y: number;
  confidence: number; // 0-1, confidence of detection
}

export interface End {
  id: string;
  endNumber: number;
  arrows: ArrowScore[];
  total: number;
  imageUri?: string;  // foto de la diana para este turno
  timestamp: number;
}

export interface Session {
  id: string;
  archerName: string;
  date: number;           // timestamp
  roundType: RoundType;
  arrowsPerEnd: number;   // 3 o 6
  totalEnds: number;
  ends: End[];
  grandTotal: number;
  maxPossible: number;
}

export interface Archer {
  id: string;
  name: string;
  bowType: 'recurvo' | 'compuesto' | 'arco_largo' | 'barebow' | 'tradicional';
  accessories: {
    mira: boolean;
    lupa: boolean;
    visor_peep: boolean;
    cliquer: boolean;
    release: boolean;
    dedil: boolean;
    dragonera: boolean;
    estabilizador: boolean;
    estabilizador_lateral: boolean;
    amortiguador: boolean;
    v_bar: boolean;
    flecha_carbono: boolean;
    flecha_aluminio: boolean;
    flecha_madera: boolean;
    flecha_acero: boolean;
    brazal: boolean;
    protector_pecho: boolean;
    rest: boolean;
    nocking_point: boolean;
    silenciadores: boolean;
    arco_desmontable: boolean;
  };
  category: string;
}

export type RootStackParamList = {
  Tabs: undefined;
  NewSession: undefined;
  Camera: { sessionId: string; endNumber: number; arrowsPerEnd: number };
  ScoreReview: {
    sessionId: string;
    endNumber: number;
    detectedArrows: ArrowScore[];
    imageUri: string;
  };
  SessionDetail: { sessionId: string };
  RankInfo: undefined;
};

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  VS: undefined;
  History: undefined;
  Settings: undefined;
};

// Helpers
export function arrowToPoints(score: ArrowScore): number {
  if (score === 'X') return 10;
  if (score === 'M') return 0;
  return parseInt(score, 10);
}

export function endTotal(arrows: ArrowScore[]): number {
  return arrows.reduce((acc, a) => acc + arrowToPoints(a), 0);
}

export function roundLabel(roundType: RoundType): string {
  const labels: Record<RoundType, string> = {
    indoor_18m: 'Indoor 18m',
    indoor_25m: 'Indoor 25m',
    outdoor_30m: 'Outdoor 30m',
    outdoor_50m: 'Outdoor 50m',
    outdoor_70m: 'Outdoor 70m',
    field: 'Campo',
    custom: 'Personalizado',
  };
  return labels[roundType];
}

export const ARROW_SCORES: ArrowScore[] = [
  'X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M',
];

export function isSessionFinished(session: Session): boolean {
  return session.ends.length >= session.totalEnds;
}

export function nextEndNumber(session: Session): number {
  return session.ends.length + 1;
}

export const SCORE_COLORS: Record<string, string> = {
  X:    '#F9A825',
  '10': '#F9A825',
  '9':  '#F9A825',
  '8':  '#C62828',
  '7':  '#C62828',
  '6':  '#1565C0',
  '5':  '#1565C0',
  '4':  '#212121',
  '3':  '#212121',
  '2':  '#F5F5F5',
  '1':  '#F5F5F5',
  M:    '#757575',
};

export function scoreTextColor(score: string): string {
  if (score === '2' || score === '1') return '#F5F5F5';
  if (score === '4' || score === '3') return '#F5F5F5';
  return SCORE_COLORS[score] ?? '#ffffff';
}

export function scoreBgColor(score: string): string {
  if (score === '2' || score === '1') return '#424242';
  if (score === '4' || score === '3') return '#212121';
  return SCORE_COLORS[score] + '22';
}

export function scoreBorderColor(score: string): string {
  if (score === '2' || score === '1') return '#757575';
  if (score === '4' || score === '3') return '#424242';
  return SCORE_COLORS[score];
}
